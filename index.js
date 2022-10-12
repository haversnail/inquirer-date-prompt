import chalk from "chalk";
import cliCursor from "cli-cursor";
import Prompt from "inquirer/lib/prompts/base.js";
import observe from "inquirer/lib/utils/events.js";
import { map, takeUntil } from "rxjs/operators";

/**
 * A lookup object that maps each date part type to the corresponding
 * getter & setter method on the `Date` prototype.
 * @type {Record<Intl.DateTimeFormatPartTypes, keyof Date>}
 */
const fnLookup = {
  year: "FullYear",
  month: "Month",
  day: "Date",
  hour: "Hours",
  minute: "Minutes",
  second: "Seconds",
};

/**
 * @type {Intl.DateTimeFormatPartTypes[]}
 */
const editableTypes = Object.keys(fnLookup);

/**
 * Returns the index of the _last_ element in the array where predicate is true, and -1 otherwise.
 * @template {*} T
 * @param {T[]} array
 * @param {(value: T, index: number, obj: T[]) => boolean} predicate
 */
const findLastIndex = function findLastIndex(array, predicate) {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) return l;
  }
  return -1;
};

/**
 * Represents a date prompt.
 */
class DatePrompt extends Prompt {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);
    // If default value is not a date, throw an error:
    if (this.opt.default && !(this.opt.default instanceof Date)) {
      throw new Error("The `default` parameter should be a date instance");
    }
    // Set the format object based on the user's specified options:
    const { locale, format = {} } = this.opt;
    this.format = Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      ...format,
    });
    // Set the date object with either the default value or the current date:
    this.date = this.opt.default || new Date();
    // Clear the default value option (so it won't be printed by the Prompt class):
    this.opt.default = null;
    // Set the initial dirty state:
    this.isDirty = false;
    // Set the initial cleared state:
    this.isCleared = false;
    // Set the first and last indices of the editable date parts:
    this.firstEditableIndex = this.dateParts.findIndex((part) => editableTypes.includes(part.type));
    this.lastEditableIndex = findLastIndex(this.dateParts, (part) => editableTypes.includes(part.type));
    // Set the cursor index to the first editable part:
    this.cursorIndex = this.firstEditableIndex;
  }

  // Called by parent class:
  _run(cb) {
    this.done = cb;

    // Observe events:
    const events = observe(this.rl);
    const submit = events.line.pipe(map(() => (this.isCleared ? null : this.date)));
    const validation = this.handleSubmitEvents(submit);
    validation.success.forEach(this.onEnd.bind(this));
    validation.error.forEach(this.onError.bind(this));
    events.keypress.pipe(takeUntil(validation.success)).forEach(this.onKeypress.bind(this));

    // Init the prompt:
    cliCursor.hide();
    this.render();

    return this;
  }

  /**
   * Renders the prompt.
   * @param {string} [error]
   */
  render(error) {
    let message = this.getQuestion(); // The question portion of the output, including any prefix and suffix

    const { isDirty, isCleared } = this;
    const isFinal = this.status === "answered";

    if (!isCleared) {
      const dateString = this.dateParts
        .map(({ value }, index) =>
          isFinal
            ? chalk.cyan(value)
            : index === this.cursorIndex
            ? chalk.inverse(value)
            : !isDirty
            ? chalk.dim(value)
            : value,
        )
        .join("");

      // Apply the transformer function if one was provided:
      message += this.opt.transformer
        ? this.opt.transformer(dateString, this.answers, { isDirty, isCleared, isFinal })
        : dateString;

      // Display info on how to clear if the prompt is clearable:
      if (this.opt.clearable && !isFinal) {
        message += chalk.dim(" (<delete> to clear) ");
      }
    }

    const bottomContent = error ? chalk.red(">> ") + error : "";

    // Render the final message:
    this.screen.render(message, bottomContent);
  }

  /**
   * The end event handler.
   * @param {import('inquirer').prompts.SuccessfulPromptStateData<Date | null>} state
   */
  onEnd({ value }) {
    this.answer = value;
    this.status = "answered";

    // Re-render prompt
    this.render();

    this.screen.done();
    cliCursor.show();
    this.done(value);
  }

  /**
   * The error event handler.
   * @param {import('inquirer').prompts.FailedPromptStateData} state
   */
  onError({ isValid }) {
    this.render(isValid);
  }

  /**
   * The array of date part objects according to the user's specified format.
   */
  get dateParts() {
    return this.format.formatToParts(this.date);
  }

  /**
   * The currently selected date part.
   */
  get currentDatePart() {
    return this.dateParts[this.cursorIndex];
  }

  /**
   * A Boolean value indicating whether the currently selected date part is editable.
   */
  get isCurrentDatePartEditable() {
    return !editableTypes.includes(this.currentDatePart.type);
  }

  /**
   * Moves the cursor index to the right.
   */
  incrementCursorIndex() {
    if (this.cursorIndex < this.lastEditableIndex) {
      this.cursorIndex++;
    }
  }

  /**
   * Moves the cursor index to the left.
   */
  decrementCursorIndex() {
    if (this.cursorIndex > this.firstEditableIndex) {
      this.cursorIndex--;
    }
  }

  /**
   * Shifts the currently selected date part to the specified offset value.
   * The default value is `0`.
   * @param {number} offset
   */
  shiftDatePartValue(offset = 0) {
    // Set the input as "dirty" now that the initial date is being changed:
    this.isDirty = true;
    const { type } = this.currentDatePart;
    if (fnLookup[type]) {
      const setter = "set" + fnLookup[type];
      const getter = "get" + fnLookup[type];
      this.date[setter](this.date[getter]() + offset);
    }
  }

  /**
   * Increments the currently selected date part by one.
   */
  incrementDatePartValueBy(value = 1) {
    this.shiftDatePartValue(value);
  }

  /**
   * Decrements the currently selected date part by one.
   */
  decrementDatePartValueBy(value = 1) {
    this.shiftDatePartValue(-1 * value);
  }

  /**
   * The keypress event handler.
   * @typedef {{ key: import('readline').Key, value?: string }} KeyDescriptor
   * @param {KeyDescriptor} descriptor
   */
  onKeypress({ key }) {
    // Reset cleared state if any other key is pressed:
    if (this.isCleared) this.isCleared = false;
    // Calculate the amount to increment/decrement by based on modifiers:
    const amount = key.shift ? (key.meta ? 100 : 10) : 1;

    switch (key.name) {
      case "right":
        do {
          this.incrementCursorIndex();
        } while (this.isCurrentDatePartEditable); // increments the cursor index until it hits an editable value
        break;
      case "left":
        do {
          this.decrementCursorIndex();
        } while (this.isCurrentDatePartEditable); // decrements the cursor index until it hits an editable value
        break;
      case "up":
        this.incrementDatePartValueBy(amount);
        break;
      case "down":
        this.decrementDatePartValueBy(amount);
        break;
      case "delete":
      case "backspace":
        if (this.opt.clearable) this.isCleared = true;
        break;
    }

    this.render();
  }
}

export default DatePrompt;

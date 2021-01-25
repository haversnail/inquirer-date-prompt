import "inquirer";

declare module "inquirer" {
  /**
   * Provides options for a question for the `DatePrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface DateQuestionOptions<T extends Answers = Answers> extends Question<T> {
    /**
     * Transforms the value to display to the user.
     *
     * @param date
     * The currently selected date in string format.
     *
     * @param answers
     * The answers provided by the users.
     *
     * @param flags
     * Additional information about the value.
     *
     * @returns
     * The value to display to the user.
     */
    transformer?(
      date: string,
      answers: T,
      flags: { isDirty?: boolean; isCleared?: boolean; isFinal?: boolean },
    ): string | Promise<string>;

    /**
     * A Boolean value indicating whether the prompt is clearable.
     * If `true`, pressing `backspace` or `delete` will replace the current value with `null`.
     */
    clearable?: boolean;

    /**
     * A specific locale or locales to use when formatting the date.
     * If no locale is provided, it will default to the user's current locale.
     * @see the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat|Intl.DateTimeFormat} docs for more info.
     */
    locale?: string | string[];

    /**
     * A set of options for customizing the date format.
     * @see the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat|Intl.DateTimeFormat} docs for more info.
     */
    format?: Intl.DateTimeFormatOptions;
  }

  /**
   * Provides options for a question for the `InputPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface DateQuestion<T extends Answers = Answers> extends DateQuestionOptions<T> {
    /**
     * @inheritdoc
     */
    type?: "date";
  }

  /**
   * Provides the available question-types.
   *
   * @template T
   * The type of the answers.
   */
  interface QuestionMap<T extends Answers = Answers> {
    /**
     * The `DateQuestion` type.
     */
    date: DateQuestion<T>;
  }
}

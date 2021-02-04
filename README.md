<img width="75px" height="75px" align="right" alt="Inquirer Logo" src="https://raw.githubusercontent.com/SBoudrias/Inquirer.js/master/assets/inquirer_readme.svg?sanitize=true" title="Inquirer.js"/>

# inquirer-date-prompt

A comprehensive date prompt plugin for Inquirer.js.

## Why?

- **No** additional dependencies
- Leverages native [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) and [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) API
- Augmented TypeScript declarations
- Locale-agnostic [<sup>1</sup>](#caveats)
- The other plugins weren't cutting it

## Installation

```sh
npm install inquirer-date-prompt
```

## Usage

```js
const inquirer = require("inquirer");

inquirer.registerPrompt("date", require("inquirer-date-prompt"));

inquirer.prompt({
  type: "date",
  // ...
});
```

Although you can use whatever type name you want, registering the prompt with a type of `'date'` will afford you IntelliSense when specifying the prompt options, thanks to TypeScript's [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).

## Prompt

To change the date, simply use the left <kbd>&larr;</kbd> and right <kbd>&rarr;</kbd> arrow keys to move the cursor, and up <kbd>&uarr;</kbd> and down <kbd>&darr;</kbd> to change the value. You can also use modifier keys to determine by how much to increase or decrease the value:

- &plusmn;**10**: Shift + Arrow (&#8679;&darr;)
- &plusmn;**100**: Option/Alt + Shift + Arrow (&#8997;&#8679;&darr;)

<p align="center">
  <img src="https://raw.githubusercontent.com/haversnail/inquirer-date-prompt/master/examples/demo.gif" alt="Demo" width="480">
</p>

## Options

> **Note**: _allowed options written inside square brackets (`[]`) are optional. Others are required._

`type`, `name`, `message` [, `default`, `filter`, `validate`, `transformer`, `locale`, `format`, `clearable`]

### `default` (Date)

- `default` is expected to be a [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instance if used. If no default value is provided, the prompt will default to the current date and time.

### `transformer` (Function)

- In addition to the [default arguments](https://github.com/SBoudrias/Inquirer.js/blob/master/README.md#questions), the `transformer` function supports the following Boolean flags:
  - `isFinal`: Indicates whether a final answer has been selected
  - `isDirty`: Indicates whether the input has been modified by the user
  - `isCleared`: Indicates whether the input has been cleared (if the `clearable` option has been enabled)

### `locale` [<sup>1</sup>](#caveats) (String | Array\<String\>)

- A specific [locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) or locales to use when formatting the date. If no locale is provided, it will default to the user's current locale.

<p align="center">
  <img src="https://raw.githubusercontent.com/haversnail/inquirer-date-prompt/master/examples/locale.gif" alt="Demo" width="480">
</p>

### `format` (Intl.DateTimeFormatOptions)

- A [`DateTimeFormatOptions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) object for customizing the date format. By default, all editable parts default to `'numeric'`.

### `clearable` (Boolean)

- A Boolean value indicating whether the input can be cleared. If `true`, hitting <kbd>delete</kbd> or <kbd>backspace</kbd> will clear the prompt and set its current value to `null`. Pressing any other key before returning will restore the state to its previous value.

See the [`inquirer` README](https://github.com/SBoudrias/Inquirer.js/blob/master/README.md) for details on all other options.

## Example

```js
async function getTimestamp(date) {
  const { timestamp } = await inquirer.prompt({
    type: "date",
    name: "timestamp",
    message: "When will the world end?",
    prefix: " 🌎 ",
    default: date,
    filter: (d) => Math.floor(d.getTime() / 1000),
    validate: (t) => t * 1000 > Date.now() + 86400000 || "God I hope not!",
    transformer: (s) => chalk.bold.red(s),
    locale: "en-US",
    format: { month: "short", hour: undefined, minute: undefined },
    clearable: true,
  });
  return timestamp;
}
```

<p align="center">
  <img src="https://raw.githubusercontent.com/haversnail/inquirer-date-prompt/master/examples/end.gif" alt="Demo" width="480">
</p>

## Caveats

1. Be aware that even though this plugin works with Node &ge; v10, specifying a locale other than `'en-US'` while running on any version less than 13.0.0 will fail silently. See the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#browser_compatibility) for more details.

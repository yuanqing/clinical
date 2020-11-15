# clinical [![npm Version](https://img.shields.io/npm/v/clinical?cacheSeconds=1800)](https://www.npmjs.org/package/clinical) [![build](https://github.com/yuanqing/clinical/workflows/build/badge.svg)](https://github.com/yuanqing/clinical/actions?query=workflow%3Abuild)

> A minimum-viable arguments parser in [~90 LOC](src/index.ts) with zero dependencies

## Features

- Casts values to the appropriate JavaScript primitive type
- Converts option keys to camelCase
- Throws on duplicated options
- Stops parsing options after `--`
- Prints the supplied version on `--version` or `-v`
- Prints the supplied help message on `--help` or `-h`

## Example

```sh
$ npm install --save clinical
```

<!-- ```js markdown-interpolate: cat example/cli.ts -->
```js
#!/usr/bin/env node

import clinical from 'clinical'

try {
  const result = clinical('1.0.0', 'my help message')
  console.log(result)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
```
<!-- ``` end -->

```sh
$ my-cli --foo --bar 42 -x=y -- baz null
{
  options: { foo: true, bar: 42, x: 'y' },
  positionals: [ 'baz', null ]
}
```

```sh
$ my-cli --version
1.0.0
```

```sh
$ my-cli --help
my help message
```

## API

```ts
import clinical from 'clinical'
```

### const result = clinical(version, helpMessage [, args = process.argv.slice(2)])

- **`version`** (*`string`*) – *Required.* Writes this string to `stdout` on encountering the `--version` or `-v` flag, then exits the `process`.
- **`helpMessage`** (*`string`*) – *Required.* Writes this string to `stdout` on encountering the `--help` or `-h` flag, then exits the `process`.
- **`args`** (*`Array<string>`*) – *Optional.* The arguments to be parsed. Defaults to `process.argv.slice(2)`.

The returned `result` object has the following keys:

- **`positionals`** (*`Array<boolean | null | number | string>`*)
- **`options`** (*`{ [key: string]: boolean | null | number | string }`*)

## Installation

```sh
$ npm install --save clinical
```

## License

[MIT](/LICENSE.md)

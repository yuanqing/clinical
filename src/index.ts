export type Value = boolean | null | number | string

export default function (
  version: string,
  help: string,
  args: Array<string> = process.argv.slice(2)
): void | {
  positionals: Array<Value>
  options: { [key: string]: Value }
} {
  const positionals: Array<Value> = []
  const options: { [key: string]: Value } = {}
  let stopParsingOptions = false
  let i = -1
  while (++i < args.length) {
    const currentArg = args[i]
    if (currentArg === '--' && stopParsingOptions === false) {
      stopParsingOptions = true
      continue
    }
    const currentOption = parseOption(currentArg)
    if (stopParsingOptions === true || currentOption === null) {
      positionals.push(castToValue(currentArg))
      continue
    }
    if (/^h(?:elp)?$/.test(currentOption.name) === true) {
      console.log(help) // eslint-disable-line no-console
      process.exit()
    }
    if (/^v(?:ersion)?$/.test(currentOption.name) === true) {
      console.log(version) // eslint-disable-line no-console
      process.exit()
    }
    if (typeof options[currentOption.name] !== 'undefined') {
      throw new Error(`Duplicate option: ${currentOption.name}`)
    }
    if (currentOption.value !== null) {
      options[currentOption.name] = castToValue(currentOption.value)
      continue
    }
    const nextArg = args[i + 1]
    const nextOption = parseOption(nextArg)
    if (nextOption === null) {
      options[currentOption.name] = castToValue(nextArg)
      ++i
      continue
    }
    options[currentOption.name] = true
  }
  return { options, positionals }
}

function parseOption(
  arg: undefined | string
): null | { name: string; value: null | string } {
  if (typeof arg === 'undefined') {
    return null
  }
  const matches = arg.match(/^--?(\w[\w-]*)(?:=(.*))?$/)
  if (matches === null) {
    return null
  }
  return {
    name: matches[1].replace(/-(\w)/g, function (_, character) {
      return character.toUpperCase()
    }),
    value: typeof matches[2] === 'undefined' ? null : matches[2]
  }
}

function castToValue(arg: string): Value {
  if (arg === 'false') {
    return false
  }
  if (arg === 'true') {
    return true
  }
  if (arg === 'null') {
    return null
  }
  if (/^-?(?:\d*\.)?\d+$/.test(arg) === true) {
    return parseFloat(arg) as number
  }
  return arg
}

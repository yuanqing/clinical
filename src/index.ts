export type Value = boolean | null | number | string

export default function (
  version: string,
  helpMessage: string,
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
      console.log(helpMessage) // eslint-disable-line no-console
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
    if (typeof nextArg === 'undefined' || nextArg === '--') {
      options[currentOption.name] = true
      continue
    }
    const nextOption = parseOption(nextArg)
    if (nextOption !== null) {
      options[currentOption.name] = true
      continue
    }
    options[currentOption.name] = castToValue(nextArg)
    ++i
  }
  return { options, positionals }
}

function parseOption(
  arg: string
): null | { name: string; value: null | string } {
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

function castToValue(arg: undefined | string): Value {
  if (typeof arg === 'undefined' || arg === 'true') {
    return true
  }
  if (arg === 'false') {
    return false
  }
  if (arg === 'null') {
    return null
  }
  if (/^-?(?:\d*\.)?\d+$/.test(arg) === true) {
    return parseFloat(arg) as number
  }
  return arg
}

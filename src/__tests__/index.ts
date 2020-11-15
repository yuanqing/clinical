import * as childProcess from 'child_process'
import * as path from 'path'
import { test } from 'tap'

import clinical, { Value } from '../index'

export const tests: Array<{
  name: string
  testCases: Array<
    | [Array<string>, { [key: string]: Value }, Array<Value>]
    | [Array<string>, string]
  >
}> = [
  {
    name: 'Casts values to the appropriate JavaScript primitive type',
    testCases: [
      [['false'], {}, [false]],
      [['true'], {}, [true]],
      [['null'], {}, [null]],
      [['1'], {}, [1]],
      [['0'], {}, [0]],
      [['42'], {}, [42]],
      [['-7'], { 7: true }, []],
      [['.5'], {}, [0.5]],
      [['-.5'], {}, [-0.5]],
      [['3.142'], {}, [3.142]],
      [['-3.142'], {}, [-3.142]],
      [['x'], {}, ['x']],
      [['bar'], {}, ['bar']],
      [['-y'], { y: true }, []],
      [['-baz'], { baz: true }, []],
      [['--z'], { z: true }, []],
      [['--qux'], { qux: true }, []],
      [['--foo', 'false'], { foo: false }, []],
      [['--foo', 'true'], { foo: true }, []],
      [['--foo', 'null'], { foo: null }, []],
      [['--foo', '1'], { foo: 1 }, []],
      [['--foo', '0'], { foo: 0 }, []],
      [['--foo', '42'], { foo: 42 }, []],
      [['--foo', '-7'], { 7: true, foo: true }, []],
      [['--foo', '.5'], { foo: 0.5 }, []],
      [['--foo', '-.5'], { foo: -0.5 }, []],
      [['--foo', '3.142'], { foo: 3.142 }, []],
      [['--foo', '-3.142'], { foo: -3.142 }, []],
      [['--foo', 'x'], { foo: 'x' }, []],
      [['--foo', 'bar'], { foo: 'bar' }, []],
      [['--foo', '-y'], { foo: true, y: true }, []],
      [['--foo', '-baz'], { baz: true, foo: true }, []],
      [['--foo', '--z'], { foo: true, z: true }, []],
      [['--foo', '--qux'], { foo: true, qux: true }, []],
      [['--foo=false'], { foo: false }, []],
      [['--foo=true'], { foo: true }, []],
      [['--foo=null'], { foo: null }, []],
      [['--foo=1'], { foo: 1 }, []],
      [['--foo=0'], { foo: 0 }, []],
      [['--foo=42'], { foo: 42 }, []],
      [['--foo=-7'], { foo: -7 }, []],
      [['--foo=.5'], { foo: 0.5 }, []],
      [['--foo=-.5'], { foo: -0.5 }, []],
      [['--foo=3.142'], { foo: 3.142 }, []],
      [['--foo=-3.142'], { foo: -3.142 }, []],
      [['--foo=x'], { foo: 'x' }, []],
      [['--foo=bar'], { foo: 'bar' }, []],
      [['--foo=-y'], { foo: '-y' }, []],
      [['--foo=-baz'], { foo: '-baz' }, []],
      [['--foo=--z'], { foo: '--z' }, []],
      [['--foo=--qux'], { foo: '--qux' }, []]
    ]
  },
  {
    name: 'Converts option keys to camelCase',
    testCases: [
      [['--foo-bar'], { fooBar: true }, []],
      [['--foo-bar', '42'], { fooBar: 42 }, []]
    ]
  },
  {
    name: 'Throws on duplicated options',
    testCases: [[['--foo', '--foo'], 'Duplicate option: foo']]
  },
  {
    name: 'Stops parsing options after `--`',
    testCases: [
      [['--'], {}, []],
      [['--', '--'], {}, ['--']],
      [['--', '--foo'], {}, ['--foo']],
      [['--foo', '--'], { foo: true }, []],
      [['--', '--foo', '-baz'], {}, ['--foo', '-baz']],
      [['--foo', '--', '-baz'], { foo: true }, ['-baz']],
      [['--foo', '-baz', '--'], { baz: true, foo: true }, []],
      [['--', '--foo', '-baz', '--foo'], {}, ['--foo', '-baz', '--foo']],
      [['--foo', '--', '-baz', '--foo'], { foo: true }, ['-baz', '--foo']],
      [['--foo', '-baz', '--', '--foo'], { baz: true, foo: true }, ['--foo']],
      [['--foo', '-baz', '--foo', '--'], 'Duplicate option: foo']
    ]
  }
]

for (const { name, testCases } of tests) {
  test(name, function (t) {
    for (const testCase of testCases) {
      if (testCase.length === 3) {
        const result = clinical('1.0.0', 'my help message', testCase[0])
        if (typeof result === 'undefined') {
          t.fail()
          continue
        }
        t.deepEqual(result.options, testCase[1])
        t.deepEqual(result.positionals, testCase[2])
        continue
      }
      if (testCase.length === 2) {
        try {
          clinical('1.0.0', 'my help message', testCase[0])
          t.fail()
        } catch (error) {
          t.equal(error.message, testCase[1])
        }
        continue
      }
      t.fail()
    }
    t.end()
  })
}

const cliFilePath = path.resolve(__dirname, '..', '__fixtures__', 'cli.ts')

test('Prints the specified version on `--version` or `-v`', function (t) {
  t.equal(
    childProcess.execSync(`ts-node ${cliFilePath} --version`).toString(),
    'foo\n'
  )
  t.equal(
    childProcess.execSync(`ts-node ${cliFilePath} -v`).toString(),
    'foo\n'
  )
  t.end()
})

test('Prints the specified help message on `--help` or `-h`', function (t) {
  t.equal(
    childProcess.execSync(`ts-node ${cliFilePath} --help`).toString(),
    'bar\n'
  )
  t.equal(
    childProcess.execSync(`ts-node ${cliFilePath} -h`).toString(),
    'bar\n'
  )
  t.end()
})

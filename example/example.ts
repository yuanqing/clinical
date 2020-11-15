import clinical from 'clinical'

try {
  const result = clinical('1.0.0', 'help message')
  console.log(result)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

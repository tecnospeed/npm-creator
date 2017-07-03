var async = require('async')
var chalk = require('chalk')
var minimist = require('minimist')
var Spinner = require('cli-spinner').Spinner

var args = minimist(process.argv.slice(2))
var lang = require('../lib/get_lang')()

if (args.v || args.version) {
  console.log(require('../package.json').version)
  process.exit()
}

if (!args._.length) {
  console.log()
  console.log('  ' + lang.COMMAND_USAGE)
  console.log()
  console.log('  ' + lang.COMMAND_OPTIONS + ':')
  console.log()
  console.log('    -v, --version\t' + lang.VERSION_DESCRIPTION)
  console.log('    -t, --type\t\t' + lang.TYPE_DESCRIPTION)
  console.log('    -l, --license\t' + lang.LICENSE_DESCRIPTION)
  process.exit()
}

function errorExit (message) {
  console.log(chalk.red(message))
  process.exit(1)
}

var type = (args.t || args.type || 'bin-lib').toLowerCase()

if (type && ['bin-lib', 'lib'].indexOf(type) === -1) {
  errorExit(lang.INVALID_TYPE)
}

var license = (args.l || args.license || 'mit').toLowerCase()

if (license && ['mit', 'apache', 'gnu'].indexOf(license) === -1) {
  errorExit(lang.INVALID_LICENSE)
}

var checkName = require('../lib/check_name')
var confirmName = require('../lib/confirm_name')
var downloadTemplate = require('../lib/download_template')
var createStructure = require('../lib/create_structure')

var begin
var options = {
  name: args._[0],
  type: type,
  license: license
}

async.series([
  function (next) {
    console.log()
    var spinner = new Spinner('%s ' + lang.CHECKING_AVAILABILITY)
    spinner.start()
    checkName(options, function (err, isNameAvailable) {
      spinner.stop(true)
      if (err) return next(err)
      if (isNameAvailable) {
        console.log(chalk.green.bold('[ok] ') + lang.CHECKING_AVAILABILITY)
        return next()
      }
      confirmName(function (err) {
        if (err) return next(err)
        console.log()
        next()
      })
    })
  },
  function (next) {
    begin = new Date().getTime()
    next()
  },
  function (next) {
    var spinner = new Spinner('%s ' + lang.DOWNLOADING_TEMPLATE)
    spinner.start()
    downloadTemplate(options, function (err) {
      spinner.stop(true)
      if (err) return next(err)
      console.log(chalk.green.bold('[ok] ') + lang.DOWNLOADING_TEMPLATE)
      next()
    })
  },
  function (next) {
    var spinner = new Spinner('%s ' + lang.CREATING_STRUCTURE)
    spinner.start()
    createStructure(options, function (err) {
      spinner.stop(true)
      if (err) return next(err)
      console.log(chalk.green.bold('[ok] ') + lang.CREATING_STRUCTURE)
      next()
    })
  }
], function (err) {
  if (err && err.message === 'EXIT') process.exit()
  console.log()
  if (err) return errorExit(lang[err.message])
  var timeElapsed = (new Date().getTime() - begin) / 1000
  console.log(lang.PROCESS_FINISHED + chalk.gray(' (' + timeElapsed.toFixed(2) + 's)'))
  process.exit()
})

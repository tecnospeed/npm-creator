var fs = require('fs')
var path = require('path')
var request = require('request')
var unzip = require('unzip')
var mv = require('mv')

module.exports = function (options, callback) {
  var params = {
    uri: 'https://github.com/tecnospeed/npm-creator-template/archive/master.zip',
    rejectUnauthorized: false,
    timeout: 3000,
    encoding: null
  }

  var pathModule = path.join(process.cwd(), options.name)

  if (fs.existsSync(pathModule)) {
    return callback(new Error('PATH_EXIST'))
  }

  request(params, function (err, resp, body) {
    if (err) return callback(new Error('REQUEST'))
    var fileZip = path.join(require('os').homedir(), 'npm-creator-master.zip')
    fs.writeFile(fileZip, body, function (err) {
      if (err) return callback(new Error('WRITE_FILE'))
      var unzipStream = unzip.Extract({ path: require('os').homedir() })
      unzipStream.on('error', function () {
        return callback(new Error('REQUEST'))
      })
      unzipStream.on('close', function () {
        fs.unlinkSync(fileZip)
        mv(path.join(require('os').homedir(), 'npm-creator-template-master'), pathModule, {mkdirp: true}, function (err) {
          if (err) return callback(new Error('REQUEST'))
          callback()
        })
      })
      var readStream = fs.createReadStream(fileZip)
      readStream.pipe(unzipStream)
    })
  })
}

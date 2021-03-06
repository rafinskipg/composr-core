'use strict'

var check = require('syntax-error')
var ramlCompiler = require('../compilers/raml.compiler')
var utils = require('../utils')
var vm = require('vm')
var semver = require('semver')
var vUtils = utils.values

function validate (phrase) {
  var errors = []

  var errorAccumulator = utils.errorAccumulator(errors)

  errorAccumulator(vUtils.isValue, phrase, 'undefined:phrase')
  errorAccumulator(vUtils.isValue, phrase.url, 'undefined:phrase:url')
  errorAccumulator(vUtils.isValidEndpoint, phrase.url, 'error:phrase:url:syntax')

  errorAccumulator(semver.valid, phrase.version, 'incorrect:phrase:version')

  var methodPresent = false

  ;['get', 'post', 'put', 'delete', 'options'].forEach(function (method) {
    if (phrase[method]) {
      var code

      if (!phrase[method].codehash) {
        var isCandidate = errorAccumulator(vUtils.isValue, phrase[method].code, 'undefined:phrase:' + method + ':code')
        if (isCandidate) {
          code = phrase[method].code
        }
      }

      if (!phrase[method].code) {
        var isValue = errorAccumulator(vUtils.isValue, phrase[method].codehash, 'undefined:phrase:' + method + ':codehash')
        var isValidBase64 = errorAccumulator(vUtils.isValidBase64, phrase[method].codehash, 'invalid:phrase:' + method + ':codehash')

        if (isValue && isValidBase64) {
          code = new Buffer(phrase[method].codehash, 'base64').toString('utf8')
        }
      }

      errorAccumulator(vUtils.isValue, phrase[method].doc, 'undefined:phrase:' + method + ':doc')

      try {
        var funct = new Function('req', 'res', 'next', 'corbelDriver', code) // eslint-disable-line
        var error = check(funct)
        if (error) {
          errors.push('error:phrase:syntax')
        }
      } catch (e) {
        errors.push('error:phrase:syntax:' + e)
      }

      try {
        var tmpScript = new vm.Script(code) // eslint-disable-line
      } catch (e) {
        errors.push('error:phrase:syntax:' + e)
      }

      methodPresent = true
    }
  })

  if (!methodPresent) {
    errors.push('undefined:phrase:http_method')
  }

  return new Promise(function (resolve, reject) {
    ramlCompiler.compile([phrase])
      .then(function () {
        if (errors.length > 0) {
          reject(errors)
        } else {
          resolve(phrase)
        }
      })
      .catch(function () {
        errors.push('error:not-raml-compilant')
        reject(errors)
      })
  })
}

module.exports = validate

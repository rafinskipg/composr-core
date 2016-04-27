'use strict'

var config = {}

module.exports = {
  set: function (options) {
    config = options
  },
  get: function () {
    return config
  },
  reset: function () {
    config = {}
  }
}

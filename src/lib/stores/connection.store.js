'use strict'

var driver = null

module.exports = {
  setDriver: function (connectionDriver) {
    driver = connectionDriver
  },
  getDriver: function () {
    return driver
  },
  reset: function () {
    driver = null
  }
}

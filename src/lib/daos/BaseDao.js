'use strict'
var connectionStore = require('../stores/connection.store')
var configurationStore = require('../stores/configuration.store')
var utils = require('../utils')
var parseToComposrError = require('../parseToComposrError')

var corbelLoad = require('./corbelLoad')
var mongoLoad = require('./mongoLoad')

var BaseDao = function (options) {
  this.COLLECTION = options.collection
}

BaseDao.prototype.load = function (id) {
  if (!id) {
    return Promise.reject('missing:id')
  }

  if(configurationStore.get().remote.corbel){
    return corbelLoad(this.COLLECTION, id);
  } else {
    return mongoLoad(this.COLLECTION, id);
  }
}

BaseDao.prototype.loadSome = function (ids) {
  var that = this

  if (!ids || !Array.isArray(ids)) {
    return Promise.reject('missing:ids')
  }

  if (connectionStore.getDriver()) {
    var caller = function (pageNumber, pageSize) {
      return connectionStore.getDriver()
        .resources
        .collection(that.COLLECTION)
        .get({
          pagination: {
            page: pageNumber,
            pageSize: pageSize
          },
          query: [{
            '$in': {
              'id': ids
            }
          }]
        })
    }

    return utils.getAllRecursively(caller)
      .catch(function (response) {
        var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' load', response.status)
        throw error
      })
  } else {
    return Promise.reject('missing:driver')
  }
}

BaseDao.prototype.loadAll = function () {
  var that = this
  var caller = function (pageNumber, pageSize) {
    return connectionStore.getDriver()
      .resources
      .collection(that.COLLECTION)
      .get({
        pagination: {
          page: pageNumber,
          pageSize: pageSize
        }
      })
  }

  return utils.getAllRecursively(caller)
    .catch(function (response) {
      var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' load', response.status)
      throw error
    })
}

BaseDao.prototype.save = function (item, driver) {
  if (!connectionStore.getDriver() && !driver) {
    return Promise.reject('missing:driver')
  }

  var that = this

  var theDriver = driver || connectionStore.getDriver()

  return theDriver
    .resources
    .resource(this.COLLECTION, item.id)
    .update(item)
    .catch(function (response) {
      var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' save', response.status)
      throw error
    })
}

BaseDao.prototype.delete = function (id, driver) {
  if (!connectionStore.getDriver() && !driver) {
    return Promise.reject('missing:driver')
  }

  if (!id) {
    return Promise.reject(parseToComposrError({}, 'Invalid ' + this.COLLECTION + ' delete', 401))
  }

  var that = this

  var theDriver = driver || connectionStore.getDriver()

  return theDriver
    .resources
    .resource(this.COLLECTION, id)
    .delete()
    .catch(function (response) {
      var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' delete', response.status)
      throw error
    })
}

module.exports = BaseDao

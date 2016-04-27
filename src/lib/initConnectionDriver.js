'use strict'

var corbel = require('corbel-js')
var connectionStore = require('./stores/connection.store')

function initConnectionDriver (config) {
  var module = this

  if(config.remote.corbel){
    return initCorbelDriver(config.remote.corbel)
      .then(function(data){
        module.events.emit('debug', 'login:successful')
      })
      .catch(function(err){
        module.events.emit('error', 'login:invalid:response', err.status, err.data)
      })
  } else {
    return initMongoDriver(config.remote.mongo)
  }
}

function initMongoDriver(mongoOptions){

  // Connect to database
  return new Promise(function(resolve, reject){
    mongoose.connect(mongoOptions.uri, mongoOptions.options);

    var db = mongoose.connection;
    db.on('error', function(error){
      console.error('Connection error:', error)
      reject(error)
    })

    db.once('open', function() {
      resolve();
    })

    connectionStore.setDriver(db)
  })
}

function initCorbelDriver(corbelOptions){

  if (!corbelOptions.credentials.clientId) {
    return Promise.reject('Missing config.credentials.clientId')
  }

  if (!corbelOptions.credentials.clientSecret) {
    return Promise.reject('Missing config.credentials.clientSecret')
  }

  if (!corbelOptions.credentials.scopes) {
    return Promise.reject('Missing config.credentials.scopes')
  }

  if (!corbelOptions.urlBase) {
    return Promise.reject('Missing config.urlBase')
  }

  var options = {
    clientId: corbelOptions.credentials.clientId,
    clientSecret: corbelOptions.credentials.clientSecret,
    scopes: corbelOptions.credentials.scopes,
    urlBase: corbelOptions.urlBase
  }

  var driver = corbel.getDriver(options)

  return driver
    .iam
    .token()
    .create()
    .then(function (response) {
      if (response.data && response.data.accessToken) {
        connectionStore.setDriver(driver)
        return response.data
      } else {
        throw new Error('login:invalid:response')
      }
    })
}

module.exports = initConnectionDriver

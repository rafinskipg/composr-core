var connectionStore = require('../stores/connection.store')
var parseToComposrError = require('../parseToComposrError')

function corbelLoad(collection, id){
  if (connectionStore.getDriver()) {
    return connectionStore.getDriver()
      .resources
      .resource(collection, id)
      .get()
      .then(function (response) {
        return response.data
      })
      .catch(function (response) {
        var error = parseToComposrError(response.data, 'Invalid ' + collection + ' load', response.status)
        throw error
      })
  } else {
    return Promise.reject('missing:driver')
  }
}

module.exports = corbelLoad;
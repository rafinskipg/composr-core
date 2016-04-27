var connectionStore = require('../stores/connection.store')
var parseToComposrError = require('../parseToComposrError')
var mongoose = require('mongoose')

function mongoLoad(collection, id){
  if (connectionStore.getDriver()) {
    var collectionModel = mongoose.model(collection);

    return new Promise(function(resolve, reject){
      collectionModel.findById(id, function (err, found) {
        if(err){
          return reject(err)
        }
        resolve(found)
      }); 
    })
    
  } else {
    return Promise.reject('missing:driver')
  }
}

module.exports = mongoLoad;
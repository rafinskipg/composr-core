'use strict'

var _ = require('lodash')

function getConfiguration (options) {
  // TODO: read from .composrrc from project root
  var defaultConfig = {
    timeout: 10000,
    remote: {
    }
  }

  options = options || {}

  if (!options.remote) {
    throw new Error('Sorry no remote configured!');
  }

  if (options.remote.corbel){
    if(!options.remote.corbel.credentials){
      throw new Error('Missing corbel credentials');
    }

    if(!options.remote.corbel.urlBase){
      throw new Error('Missing corbel urlBase');
    }

  }else{

  }
  
  return _.defaults(options, defaultConfig)
}

module.exports = getConfiguration

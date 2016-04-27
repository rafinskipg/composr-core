'use strict'

var connectionStore = require('./stores/connection.store')
var phrasesStore = require('./stores/phrases.store')
var snippetsStore = require('./stores/snippets.store')
var virtualDomainsStore = require('./stores/virtualDomain.store')
var configurationStore = require('./stores/configuration.store')

function reset () {
  configurationStore.reset()
  connectionStore.reset()
  phrasesStore.reset()
  snippetsStore.reset()
  virtualDomainsStore.reset()
}

module.exports = reset

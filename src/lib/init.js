'use strict'

function init (options, fetch) {
  var module = this

  this.reset()

  var config = this.getConfiguration(options)

  configurationStore.set(config);
  //this.setRemoteDao()

  this.Phrase.configure(this.config)

  if (!fetch) {
    return Promise.resolve()
  }

  return new Promise(function (resolve, reject) {
    // Do the stuff
    module.initCorbelDriver()
      .then(function () {
        return module.clientLogin()
      })
      .then(function () {
        return Promise.all([
          module.Phrase.load(),
          module.Snippet.load(),
          module.VirtualDomain.load()
        ])
      })
      .then(function () {
        module.events.emit('debug', 'success:initializing')
        resolve()
      })
      .catch(function (err) {
        err = err && err.data ? err.data : err
        // something failed, then reset the module to it's original state
        // TODO: emit('error') causes an unhandled execption in node.
        module.events.emit('errore', 'error:initializing', err)
        module.reset()
        reject(err)
      })
  })
}

module.exports = init

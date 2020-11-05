const Gql = require('./Gql')
const Resolve = require('./Resolve')

class Queue {

  constructor (request, object, type, ...resolves) {
    this.request = request
    this.object = object
    this.type = type
    this.resolve = new Resolve(resolves)
  }

  run () {
    return Gql[this.type](this.request, this.object).then(this.resolve.run.bind(this.resolve))
  }
}

module.exports = Queue

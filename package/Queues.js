const Gql = require('./Gql')

class Queues {

  constructor (request, ...queues) {
    this.request = request
    this.queues = []
    this.type = null
    queues.forEach(this.add.bind(this))
  }

  add (queue) {
    if (!this.type) {
      this.type = queue.type
      this.queues.push(queue)
    } else if (this.type === queue.type) {
      this.queues.push(queue)
    }
    return this
  }

  run () {
    const objects = this.queues.map(v => v.object)
    return Gql[this.type](this.request.bind(this), ...objects)
      .then(res => {
        return res.map((item, index) => {
          const format = this.queues[index].format
          return format ? format(item) : item
        })
      })
  }
}

module.exports = Queues

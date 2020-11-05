const Queue = require('./Queue.js')
const Gql = require('./Gql')

class Query {

  static init (context) {
    this.NAME = context.NAME
    this.primaryKey = context.primaryKey
    this.request = context.$request
    this.context = context
    return this
  }

  static getByPk (primaryKey, params) {
    const gql = Gql.create(this.context).register({ [this.primaryKey]: primaryKey }, params)
    const object = gql.toQuery(this.NAME.primaryKey)
    return new Queue(this.request, object, 'query', gql.resolve)
  }

  static find (args, params) {
    const gql = Gql.create(this.context).register(args, params)
    const object = gql.toQuery(this.NAME.query)
    return new Queue(this.request, object, 'query', gql.resolve)
  }

  static first (args, params) {
    const gql = Gql.create(this.context).register(args, params)
    const object = gql.toQuery(this.NAME.query)
    return new Queue(this.request, object, 'query', res => res[0], gql.resolve)
  }

  static count (args) {
    const gql = Gql.create(this.context).register(args)
    const object = gql.toCount(this.NAME.aggregate)
    return new Queue(this.request, object, 'query', res => res.aggregate.count)
  }
}

module.exports = Query

const Gql = require('./Gql.js')
const Query = require('./Query')
const Mutation = require('./Mutation')
const Queues = require('./Queues')

class Table {

  static init (engine, name, fields, primaryKey = 'id') {
    this.NAME = {
      query: name,
      subscribe: name,
      insert: 'insert_' + name,
      update: 'update_' + name,
      delete: 'delete_' + name,
      primaryKey: name + '_by_pk',
      aggregate: name + '_aggregate'
    }
    this.on_conflict = {
      constraint: name + '_pkey',
      update_columns: fields
    }
    this.tableName = name
    this.fields = fields
    this.primaryKey = primaryKey
    this.relations = {}
    this.$request = engine.gql.bind(engine)
    this.$subscribe = engine.subscribe.bind(engine)
    this.Query = class extends Query {}.init(this)
    this.Mutation = class extends Mutation {}.init(this)
    return this
  }

  static relation (field, target) {
    this.relations[field] = target
    return this
  }

  static insert () {
    return this.Mutation.insert(...arguments).run()
  }

  static update () {
    return this.Mutation.update(...arguments).run()
  }

  static increment () {
    return this.Mutation.increment(...arguments).run()
  }

  static delete () {
    return this.Mutation.delete(...arguments).run()
  }

  static getByPk () {
    return this.Query.getByPk(...arguments).run()
  }

  static query () {
    const queues = [this.$request, this.Query.find(...arguments), this.Query.count(...arguments)]
    return new Queues(...queues).run().then(([rows, total]) => ({ rows, total }))
  }

  static first () {
    return this.Query.first(...arguments).run()
  }

  static find () {
    return this.Query.find(...arguments).run()
  }

  static count () {
    return this.Query.count(...arguments).run()
  }

  static subscribe (args, params) {
    const query = Gql.subscribe(Gql.create(this).register(args, params).toQuery(this.NAME.subscribe))
    return this.$subscribe(query)
  }
}

module.exports = Table

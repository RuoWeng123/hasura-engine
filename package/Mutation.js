const Queue = require('./Queue.js')
const Gql = require('./Gql')
const { formatShortcutParams } = require('./Utils')

class Mutation {

  static init (context) {
    this.NAME = context.NAME
    this.primaryKey = context.primaryKey
    this.request = context.$request
    this.context = context
    return this
  }

  static insert (form, conflict, params) {
    const args = { objects: Array.isArray(form) ? form : [form] }
    conflict && (args.on_conflict = conflict)
    const gql = Gql.create(this.context).register(args, params)
    const object = gql.toMutation(this.NAME.insert)
    return new Queue(this.request, object, 'mutation', gql.resolve)
  }

  static increment (where, form, params) {
    const args = { where: formatShortcutParams(where, this.primaryKey), _inc: form }
    const gql = Gql.create(this.context).register(args, params)
    const object = gql.toMutation(this.NAME.update)
    return new Queue(this.request, object, 'mutation', gql.resolve)
  }

  static update (where, form, params) {
    const args = { where: formatShortcutParams(where, this.primaryKey), _set: form }
    const gql = Gql.create(this.context).register(args, params)
    const object = gql.toMutation(this.NAME.update)
    return new Queue(this.request, object, 'mutation', gql.resolve)
  }

  static delete (where, params) {
    const args = { where: formatShortcutParams(where, this.primaryKey) }
    const gql = Gql.create(this.context).register(args, params)
    const object = gql.toMutation(this.NAME.delete)
    return new Queue(this.request, object, 'mutation', gql.resolve)
  }
}

module.exports = Mutation

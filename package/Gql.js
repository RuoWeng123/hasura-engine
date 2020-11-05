const { jsonToGraphQLQuery } = require('json-to-graphql-query')
const { formatArgs, formatParams } = require('./Utils')
const unset = require('lodash.unset')
const set = require('lodash.set')
const get = require('lodash.get')

class Gql {

  static create ({ tableName, fields, relations }) {
    return new Gql(tableName, fields, relations)
  }

  static query (request, ...queries) {
    const query = queries.reduce((result, item, index) => Object.assign(result, { ['data' + (index || '')]: item }), {})
    return request(Gql.format({ query }))
      .then(res => Object.keys(res).map(key => res[key]))
      .then(res => queries.length === 1 ? res[0] : res)
  }

  static mutation (request, ...mutations) {
    const mutation = mutations.reduce((result, item, index) => Object.assign(result, { ['data' + (index || '')]: item }), {})
    return request(Gql.format({ mutation }))
      .then(res => Object.keys(res).map(key => res[key]))
      .then(res => mutations.length === 1 ? res[0] : res)
  }

  static subscribe (query) {
    return Gql.format({ subscription: { data: query } })
  }

  static format (object) {
    return jsonToGraphQLQuery(object, { pretty: true })
  }

  constructor (name, fields = [], relations = {}) {
    this._name = name
    this._args = null
    this._params = {}
    this._fields = fields.reduce((result, field) => Object.assign(result, { [field]: true }), {})
    this._relations = relations
    this.NAME = {
      query: name,
      subscribe: name,
      insert: 'insert_' + name,
      update: 'update_' + name,
      delete: 'delete_' + name,
      aggregate: name + '_aggregate'
    }
    return this
  }

  register (args, params) {
    args && (this._args = formatArgs(args))
    params && (this._params = formatParams(params))
    params && (this.resolve = params.resolve)
    return this
  }

  toCount (alias) {
    const object = {
      __aliasFor: alias,
      aggregate: {
        count: true
      }
    }
    const params = Object.assign({}, this._args)
    params.limit && delete params.limit
    params.offset && delete params.offset
    Object.keys(params).length && (object.__args = params)
    return object
  }

  toMutation (alias) {
    return {
      __aliasFor: alias,
      __args: this._args,
      affected_rows: true,
      returning: this.toObject()
    }
  }

  toQuery (alias) {
    const object = this.toObject(true)
    object.__aliasFor = alias
    return object
  }

  toObject (handleArgs) {
    let object = {}
    object = this.getObjectByArgs(object, handleArgs)
    object = this.getObjectByFields(object)
    object = this.getObjectByInclude(object, handleArgs)
    object = this.getObjectByExclude(object)
    object = this.getObjectByRename(object)
    return object
  }

  getObjectByArgs (object = {}, handleArgs) {
    handleArgs && this._args && (object.__args = this._args)
    return object
  }

  getObjectByFields (object = {}) {
    const { fields } = this._params
    if (fields && fields.length) {
      object = fields.reduce((result, field) => Object.assign(result, { [field]: true }), object)
    } else {
      object = Object.assign(object, this._fields)
    }
    return object
  }

  getObjectByInclude (object = {}, handleArgs) {
    const getObject = (include = {}) => {
      return Object.keys(include).reduce((result, key) => {
        const target = this._relations[key]
        if (target) result[key] = Gql.create(target).register(...include[key]).toObject(handleArgs)
        return result
      }, {})
    }

    return Object.assign(object, getObject(this._params.include))
  }

  getObjectByExclude (object = {}) {
    const { exclude = [] } = this._params
    exclude.forEach(field => unset(object, field))
    return object
  }

  getObjectByRename (object = {}) {
    const { rename = [] } = this._params
    rename.forEach(key => {
      const [path, alias] = key.split(':')
      const [field, ...parents] = path.split('.').reverse()
      const newPath = parents.reverse().concat(alias + ':' + field).join('.')
      set(object, newPath, get(object, path))
      unset(object, path)
    })
    return object
  }
}

module.exports = Gql

const ws = require('ws')
const url = require('url')
const gql = require('graphql-tag')
const { execute } = require('apollo-link')
const { GraphQLClient } = require('graphql-request')
const { WebSocketLink } = require('apollo-link-ws')
const { SubscriptionClient } = require('subscriptions-transport-ws')
const { Binding, fromBinding } = require('./Binding')
const { jsonToGraphQLQuery } = require('json-to-graphql-query')
const Table = require('../package/Table.js')
const Queues = require('../package/Queues.js')

class Engine {
  constructor (options) {
    options && this.setOptions(options)
  }

  setOptions (options) {
    const endpoint = options.secure ? 'https://' + options.endpoint : 'http://' + options.endpoint
    this.httpClient = new GraphQLClient(endpoint, options.headers)
    if ('useWebsocket' in options && options.useWebsocket) {
      const url = options.secure ? 'wss://' + options.endpoint : 'ws://' + options.endpoint

      if (typeof define !== 'undefined' && define.amd) {
        this.webSocketLink = new WebSocketLink(new SubscriptionClient(
          url, { reconnect: true }
        ))
      }
      // Node.js
      else if (typeof module !== 'undefined' && module.exports) {
        this.webSocketLink = new WebSocketLink(new SubscriptionClient(
          url, { reconnect: true }, ws
        ))
      }
    }
  }

  formatQuery (queries, queryType = 'query') {
    if (typeof queries === 'string') {
      return queries
    }

    if (!Array.isArray(queries))
      queries = [queries]
    return `${ queryType } {${ queries.map(query => {
      if (query instanceof Binding) {
        return fromBinding(query)
      } else if (typeof query === 'object') {
        return jsonToGraphQLQuery(query)
      }
    }).join(' ') }}`
  }

  query (query, variables) {
    return this.httpClient.request(this.formatQuery(query), variables)
  }

  queries (query, variables) {
    return this.httpClient.request(this.formatQuery(query), variables)
  }

  mutation (query, variables) {
    return this.httpClient.request(this.formatQuery(query, 'mutation'), variables)
  }

  mutations (query, variables) {
    return this.httpClient.request(this.formatQuery(query, 'mutation'), variables)
  }

  subscribe (query) {
    return execute(this.webSocketLink, { query: gql`${ this.formatQuery(query, 'subscription') }` })
  }

  define () {
    return class extends Table {}.init(this, ...arguments)
  }

  queues () {
    return new Queues(this.gql.bind(this), ...arguments)
  }

  gql () {
    return this.httpClient.request(...arguments)
  }
}

module.exports = Engine

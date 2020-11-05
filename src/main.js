const Engine = require('./Engine.js')
const { binding, binding2nd } = require('./Binding.js')
const { EnumType } = require('json-to-graphql-query')
const enumType = (...arg) => new EnumType(arg)
const Table = require('../package/Table.js')
const Gql = require('../package/Gql.js')

const {
  hasuraBinding,
  hasuraBinding2nd,
  hasuraReturning,
  hasuraNodes,
  hasuraAggregate,
  hasuraCount,
  hasuraMax,
  hasuraMin,
  hasuraSum,
  hasuraStddev,
  hasuraStddevPop,
  hasuraStddevSamp,
  hasuraVarPop,
  hasuraVarSamp,
  hasuraVariance
} = require('./HasuraBinding')

const TD = {
  binding: hasuraBinding,
  binding2nd: hasuraBinding2nd,
  returning: hasuraReturning,
  nodes: hasuraNodes,
  aggregate: hasuraAggregate,
  count: hasuraCount,
  max: hasuraMax,
  min: hasuraMin,
  sum: hasuraSum,
  stddev: hasuraStddev,
  stddev_pop: hasuraStddevPop,
  stddev_samp: hasuraStddevSamp,
  var_pop: hasuraVarPop,
  var_samp: hasuraVarSamp,
  variance: hasuraVariance
}

module.exports = {
  Engine,
  Table,
  Gql,
  binding,
  binding2nd,
  enumType,
  TD
}

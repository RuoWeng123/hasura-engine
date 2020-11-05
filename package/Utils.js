const { EnumType } = require('json-to-graphql-query')
const set = require('lodash.set')
const enumType = (...arg) => new EnumType(arg)

const evolve = (transformations, object) => {
  let result = object instanceof Array ? [] : {}
  let transformation, key, type
  for (key in object) {
    transformation = transformations[key]
    type = typeof transformation
    result[key] = type === 'function'
      ? transformation(object[key])
      : transformation && type === 'object'
        ? evolve(transformation, object[key])
        : object[key]
  }
  return result
}

const deepMapValues = (obj, f) =>
  Array.isArray(obj)
    ? obj.map(val => deepMapValues(val, f))
    : typeof obj === 'object'
    ? Object.keys(obj).reduce((acc, current) => {
      let val = obj[current]
      acc[current] = val !== null && typeof val === 'object' ? deepMapValues(val, f) : f(val)
      return acc
    }, {})
    : obj

const getArgsAndParams = (options) => {
  if (Array.isArray(options)) {
    return options
  } else if (options === true) {
    return []
  } else if (typeof options === 'object') {
    return [options]
  }
  return []
}

const formatArgs = (args) =>
  evolve({
    distinct_on: enumType,
    on_conflict: {
      constraint: enumType,
      update_columns: vals => vals.map(val => enumType(val))
    },
    order_by: val => deepMapValues(val, enumType)
  }, args)

const formatParams = (params) => {
  const { include } = params
  if (!include) {
    return params
  } else {
    const result = {}
    Object.keys(include).forEach(key => {
      const path = key.split('.').join('[1].include.')
      set(result, path, getArgsAndParams(include[key]))
    })
    params.include = result
    return params
  }
}

const formatShortcutParams = function (params, pk) {
  if (typeof params === 'number') {
    params = { [pk]: { _eq: params } }
  } else if (Array.isArray(params)) {
    params = { [pk]: { _in: params } }
  }
  return params
}

module.exports = {
  formatShortcutParams,
  formatParams,
  formatArgs
}

const get = require('lodash.get')
const set = require('lodash.set')

const Handler = {
  filter: (data, options) => {
    return (data || []).filter(item => item[options])
  },
  map: (data, options) => {
    return (data || []).map(item => item[options])
  },
  get: (data, options) => {
    return get(data || {}, options)
  },
  defaultTo: (data, options) => {
    return data || options
  },
  toJson: (data) => {
    return data && JSON.parse(data)
  },
  custom: (data, options) => {
    return options(data)
  }
}

class Resolve {

  constructor (resolves = []) {
    this.resolves = resolves.filter(v => v)
  }

  run (results) {
    return this.resolves.reduce((res, item) => {
      if (typeof item === 'function') {
        return item(res)
      } else if (typeof item === 'object') {
        res = Object.keys(item).reduce((ret, string) => {
          const [path, key] = string.split(':')
          const handler = Handler[key]
          if (!handler) {
            return ret
          } else {
            const options = item[string]
            const fn = (v) => set(v, path, handler(get(v, path), options))
            if (Array.isArray(ret)) {
              ret = ret.map(fn)
            } else if (typeof ret === 'object') {
              ret = fn(ret)
            }
          }
          return ret
        }, res)
      }
      return res
    }, results)
  }
}

module.exports = Resolve

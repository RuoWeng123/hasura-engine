const {jsonToGraphQLQuery} = require('json-to-graphql-query')

class Binding {
    constructor(fieldName, args, infoOrQuery, options) {
        this.fieldName = fieldName
        this.args = args
        this.infoOrQuery = infoOrQuery
        this.options = options || {}
    }
}

function generateGraphQLQuery(o, r) {
    r = r || {}
    for (let v of o.infoOrQuery) {
        v instanceof Binding ?
            r[v.fieldName] = generateGraphQLQuery(v) : r[v] = true
    }

    if (Object.entries(o.args).length > 0) {
        r.__args = o.args
    }

    if ('aliasFor' in o.options) {
        r.__aliasFor = o.options.aliasFor
    }

    return r
}

function fromPairs(pairs) {
    var result = {}
    var idx = 0
    while (idx < pairs.length) {
        result[pairs[idx][0]] = pairs[idx][1]
        idx += 1
    }
    return result
}

function fromBinding(o, options) {
    return jsonToGraphQLQuery(fromPairs([[o.fieldName, generateGraphQLQuery(o)]]), options)
}

const binding = (...args) => {
    if (args.length === 1) {
        return (...args) => binding(fieldName, ...args)
    }
    if (args.length >= 2 && Array.isArray(args[1])) {
        args.splice(1, 0, {})
    }
    return new Binding(...args)
}

const binding2nd = (fieldName, arg1) => Array.isArray(arg1) ? (arg2) => binding(fieldName, arg2, arg1) : (arg2) => binding(fieldName, arg1, arg2)
module.exports = {Binding, binding, binding2nd, fromBinding}

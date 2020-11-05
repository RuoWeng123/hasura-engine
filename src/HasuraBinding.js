const {Binding, binding} = require('./Binding')
const {EnumType} = require('json-to-graphql-query')
const enumType = (...arg) => new EnumType(arg)

class HasuraBinding extends Binding {
    constructor(fieldName, args, infoOrQuery, options) {
        args = formatArgs(args)
        super(fieldName, args, infoOrQuery, options);
    }
}

const evolve = function evolve(transformations, object) {
    let result = object instanceof Array ? [] : {};
    let transformation, key, type;
    for (key in object) {
        transformation = transformations[key];
        type = typeof transformation;
        result[key] = type === 'function'
            ? transformation(object[key])
            : transformation && type === 'object'
                ? evolve(transformation, object[key])
                : object[key];
    }
    return result;
};

const formatArgs = (args) =>
    evolve({
        distinct_on: enumType,
        on_conflict: {
            constraint: enumType,
            update_columns: vals => vals.map(val => enumType(val)),
        },
        order_by: val => deepMapValues(val, enumType)
    }, args)

const deepMapValues = (obj, f) =>
    Array.isArray(obj)
        ? obj.map(val => deepMapValues(val, f))
        : typeof obj === 'object'
        ? Object.keys(obj).reduce((acc, current) => {
            let val = obj[current];
            acc[current] = val !== null && typeof val === 'object' ? deepMapValues(val, f) : f(val)
            return acc;
        }, {})
        : obj

const hasuraReturning = (...queries) => binding('returning', {}, queries)
const hasuraNodes = (...queries) => binding('nodes', {}, queries)
const hasuraAggregate = (...queries) => binding('aggregate', {}, queries)
const hasuraCount = (...queries) => binding('count', {}, queries)
const hasuraMax = (...queries) => binding('max', {}, queries)
const hasuraMin = (...queries) => binding('min', {}, queries)
const hasuraSum = (...queries) => binding('sum', {}, queries)
const hasuraStddev = (...queries) => binding('stddev', {}, queries)
const hasuraStddevPop = (...queries) => binding('stddev_pop', {}, queries)
const hasuraStddevSamp = (...queries) => binding('stddev_samp', {}, queries)
const hasuraVarPop = (...queries) => binding('var_pop', {}, queries)
const hasuraVarSamp = (...queries) => binding('var_samp', {}, queries)
const hasuraVariance = (...queries) => binding('variance', {}, queries)

const hasuraBinding = (...args) => {
    if (args.length === 1) {
        return (...args) => HasuraBinding(fieldName, ...args)
    }

    if (args.length >= 2 && Array.isArray(args[1])) {
        args.splice(1, 0, {})
    }
    return new HasuraBinding(...args)
}
const hasuraBinding2nd = (fieldName, arg1) => Array.isArray(arg1) ? (arg2) => hasuraBinding(fieldName, arg2, arg1) : (arg2) => hasuraBinding(fieldName, arg1, arg2)
module.exports = {
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
}

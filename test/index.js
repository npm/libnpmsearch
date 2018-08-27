'use strict'

const figgyPudding = require('figgy-pudding')
const getStream = require('get-stream')
const test = require('tap').test
const tnock = require('./util/tnock.js')

const OPTS = figgyPudding({registry: {}})({
  registry: 'https://mock.reg/'
})

const REG = OPTS.registry
const search = require('../index.js')

test('basic test', t => {
  tnock(t, REG).get('/-/v1/search?text=oo').once().reply(200, {
    objects: [
      { package: { name: 'cool', version: '1.0.0' } },
      { package: { name: 'foo', version: '2.0.0' } }
    ]
  })
  return search('oo', OPTS).then(results => {
    t.deepEquals(results, [{
      name: 'cool',
      version: '1.0.0',
      description: null,
      maintainers: null,
      keywords: null,
      date: null
    }, {
      name: 'foo',
      version: '2.0.0',
      description: null,
      maintainers: null,
      keywords: null,
      date: null
    }], 'got back an array of search results')
  })
})

test('search.stream', t => {
  tnock(t, REG).get('/-/v1/search?text=oo').once().reply(200, {
    objects: [
      { package: { name: 'cool', version: '1.0.0' } },
      { package: { name: 'foo', version: '2.0.0' } }
    ]
  })
  return getStream.array(
    search.stream('oo', OPTS)
  ).then(results => {
    t.deepEquals(results, [{
      name: 'cool',
      version: '1.0.0',
      description: null,
      maintainers: null,
      keywords: null,
      date: null
    }, {
      name: 'foo',
      version: '2.0.0',
      description: null,
      maintainers: null,
      keywords: null,
      date: null
    }], 'has a stream-based API function with identical results')
  })
})

test('only returns certain fields for each package', t => {
  const date = new Date()
  tnock(t, REG).get('/-/v1/search?text=oo').once().reply(200, {
    objects: [{
      package: {
        name: 'cool',
        version: '1.0.0',
        description: 'desc',
        maintainers: [
          {username: 'x', email: 'a@b.c'},
          {username: 'y', email: 'c@b.a'}
        ],
        keywords: ['a', 'b', 'c'],
        date: date.toISOString(),
        extra: 'lol'
      }
    }]
  })
  return search('oo', OPTS).then(results => {
    t.deepEquals(results, [{
      name: 'cool',
      version: '1.0.0',
      description: 'desc',
      maintainers: [
        {username: 'x', email: 'a@b.c'},
        {username: 'y', email: 'c@b.a'}
      ],
      keywords: ['a', 'b', 'c'],
      date: date
    }], 'only specific fields are returned')
  })
})

test('accepts a limit option', t => {
  tnock(t, REG).get('/-/v1/search?text=oo&size=3').once().reply(200, {
    objects: [
      { package: { name: 'cool', version: '1.0.0' } },
      { package: { name: 'cool', version: '1.0.0' } },
      { package: { name: 'cool', version: '1.0.0' } },
      { package: { name: 'cool', version: '1.0.0' } }
    ]
  })
  return search('oo', OPTS.concat({limit: 3})).then(results => {
    t.equal(results.length, 4, 'returns more results if endpoint does so')
  })
})

test('space-separates and URI-encodes multiple search params', t => {
  tnock(t, REG).get(
    '/-/v1/search?text=foo%20bar%3Abaz%20quux%3F%3D&size=1'
  ).reply(200, { objects: [] })
  return search(['foo', 'bar:baz', 'quux?='], OPTS.concat({limit: 1})).then(
    () => t.ok(true, 'sent parameters correctly urlencoded')
  )
})

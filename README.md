# libnpmsearch [![npm version](https://img.shields.io/npm/v/libnpmsearch.svg)](https://npm.im/libnpmsearch) [![license](https://img.shields.io/npm/l/libnpmsearch.svg)](https://npm.im/libnpmsearch) [![Travis](https://img.shields.io/travis/npm/libnpmsearch.svg)](https://travis-ci.org/npm/libnpmsearch) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/zkat/libnpmsearch?svg=true)](https://ci.appveyor.com/project/zkat/libnpmsearch) [![Coverage Status](https://coveralls.io/repos/github/npm/libnpmsearch/badge.svg?branch=latest)](https://coveralls.io/github/npm/libnpmsearch?branch=latest)

[`libnpmsearch`](https://github.com/npm/libnpmsearch) is a Node.js library for
programmatically accessing the npm search endpoint. It does **not** support
legacy search through `/-/all`.

## Example

```js
const search = require('libnpmsearch')

console.log(await search('libnpm'))
=>
[
  {
    name: 'libnpm',
    description: 'programmatic npm API',
    ...etc
  },
  {
    name: 'libnpmsearch',
    description: 'Programmatic API for searching in npm and compatible registries',
    ...etc
  },
  ...more
]
```

## Install

`$ npm install libnpmsearch`

## Table of Contents

* [Example](#example)
* [Install](#install)
* [API](#api)
  * [search opts](#opts)
  * [`search()`](#search)
  * [`search.stream()`](#search-stream)

### API

#### <a name="opts"></a> `opts` for `libnpmsearch` commands

`libnpmsearch` uses [`npm-registry-fetch`](https://npm.im/npm-registry-fetch).
All options are passed through directly to that library, so please refer to [its
own `opts`
documentation](https://www.npmjs.com/package/npm-registry-fetch#fetch-options)
for options that can be passed in.

A couple of options of note for those in a hurry:

* `opts.token` - can be passed in and will be used as the authentication token for the registry. For other ways to pass in auth details, see the n-r-f docs.
* `opts.Promise` - If you pass this in, the Promises returned by `libnpmsearch` commands will use this Promise class instead. For example: `{Promise: require('bluebird')}`

#### <a name="search"></a> `> search(query, [opts]) -> Promise`

`query` must be either a String or an Array of search terms.

If `opts.limit` is provided, it will be sent to the API to constrain the number
of returned results. You may receive more, or fewer results, at the endpoint's
discretion.

The returned Promise resolved to an Array of search results with the following
format:

```js
{
  name: String,
  version: SemverString,
  description: String || null,
  maintainers: [
    {
      username: String,
      email: String
    },
    ...etc
  ] || null,
  keywords: [String] || null,
  date: Date || null
}
```

If `opts.limit` is provided, it will be sent to the API to constrain the number
of returned results. You may receive more, or fewer results, at the endpoint's
discretion.

For streamed results, see [`search.stream`](#search-stream).

##### Example

```javascript
await search('libnpm')
=>
[
  {
    name: 'libnpm',
    description: 'programmatic npm API',
    ...etc
  },
  {
    name: 'libnpmsearch',
    description: 'Programmatic API for searching in npm and compatible registries',
    ...etc
  },
  ...more
]
```

#### <a name="search-stream"></a> `> search.stream(query, [opts]) -> Stream`

`query` must be either a String or an Array of search terms.

If `opts.limit` is provided, it will be sent to the API to constrain the number
of returned results. You may receive more, or fewer results, at the endpoint's
discretion.

The returned Stream emits one entry per search result, with each entry having
the following format:

```js
{
  name: String,
  version: SemverString,
  description: String || null,
  maintainers: [
    {
      username: String,
      email: String
    },
    ...etc
  ] || null,
  keywords: [String] || null,
  date: Date || null
}
```

For getting results in one chunk, see [`search`](#search-stream).

##### Example

```javascript
search.stream('libnpm').on('data', console.log)
=>
// entry 1
{
  name: 'libnpm',
  description: 'programmatic npm API',
  ...etc
}
// entry 2
{
  name: 'libnpmsearch',
  description: 'Programmatic API for searching in npm and compatible registries',
  ...etc
}
// etc
```

'use strict'

const figgyPudding = require('figgy-pudding')
const getStream = require('get-stream')
const npmFetch = require('npm-registry-fetch')

const SearchOpts = figgyPudding({
  limit: {}
})

module.exports = search
function search (query, opts) {
  return getStream.array(search.stream(query, opts))
}
search.stream = searchStream
function searchStream (query, opts) {
  opts = SearchOpts(opts)
  return npmFetch.json.stream('/-/v1/search', 'objects.*.package',
    opts.concat({
      query: {
        text: Array.isArray(query) ? query.join(' ') : query,
        size: opts.limit
      },
      mapJson ({
        name,
        version,
        description = null,
        maintainers = null,
        keywords = null,
        date
      }) {
        return {
          name,
          description,
          maintainers,
          keywords,
          version,
          date: date ? new Date(date) : null
        }
      }
    })
  )
}

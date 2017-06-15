import test from 'ava'
import { resolve, normalize } from 'path'
import rp from 'request-promise-native'
import Nuxt from '..'

const port = 4006
const url = (route) => 'http://localhost:' + port + route

let nuxt = null
let server = null

// Init nuxt.js and create server listening on localhost:4000
test.before('Init Nuxt.js', async t => {
  const rootDir = resolve(__dirname, 'fixtures/module')
  let config = require(resolve(rootDir, 'nuxt.config.js'))
  config.rootDir = rootDir
  config.dev = false
  config.runBuild = true
  nuxt = new Nuxt(config)
  await nuxt.init()
  server = new Nuxt.Server(nuxt)
  server.listen(port, 'localhost')
})

test('Vendor', async t => {
  t.true(nuxt.options.build.vendor.indexOf('lodash') !== -1, 'lodash added to config')
})

test('Plugin', async t => {
  t.true(normalize(nuxt.options.plugins[0].src)
    .includes(normalize('fixtures/module/.nuxt/basic.reverse.')), 'plugin added to config')
  const { html } = await nuxt.renderRoute('/')
  t.true(html.includes('<h1>TXUN</h1>'), 'plugin works')
})

test('Middleware', async t => {
  let response = await rp(url('/api'))
  t.is(response, 'It works!', '/api response is correct')
})

// Close server and ask nuxt to stop listening to file changes
test.after('Closing server and nuxt.js', t => {
  server.close()
  nuxt.close()
})

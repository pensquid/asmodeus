const handler = require('./handler')
const http = require('http')
const serveIndex = require('serve-index')
const serveStatic = require('serve-static')

const public = serveStatic('public')
const serve = serveStatic('files', { index: false })
const index = serveIndex('files', {
  stylesheet: './style.css',
  template: './index.html'
})

const server = http.createServer((req, res) => {
  const done = handler(req, res)
  
  public(req, res, (err) => {
    if (err) return done(err)
    serve(req, res, (err) => {
      if (err) return done(err)
      index(req, res, done)
    })
  })
})

server.listen(3000)
require('dotenv').config()

const handler = require('./handler')
const limiter = require('./limiter')
const http = require('http')
const serveIndex = require('serve-index')
const serveStatic = require('serve-static')
const fs = require('fs')
const escapeHtml = require('escape-html')
const { normalize } = require('path')

const htmlPath = (dir) => {
  const parts = dir.split('/')
  const crumbs = new Array(parts.length)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part) {
      crumbs[i] = `<a href='${escapeHtml(parts.slice(0, i + 1).join('/'))}'>${escapeHtml(part)}</a>`
    }
  }
  return crumbs.join(' / ')
}

const createHtmlFileList = (files, dir) => {
  let html = `<ul class='view-tiles'>`
  html += files.map((file) => {
    const path = dir.split('/').map((c) => encodeURIComponent(c))
    path.push(encodeURIComponent(file.name))

    return `
      <li>
        <a href='${escapeHtml(normalize(path.join('/')))}'>
          ${escapeHtml(file.name)}
        </a>
      </li>
    `
  }).join('\n')
  html += '</ul>'
  return html
}

const public = serveStatic('public')
const serve = serveStatic(process.env.ARCHIVE_PATH, { index: false })
const index = serveIndex(process.env.ARCHIVE_PATH, {
  stylesheet: './style.css',
  template: (locals, callback) => {
    fs.readFile('./index.html', 'utf8', (err, str) => {
      if (err) return callback(err)

      const body = str
        .replace(/\{style\}/g, locals.style)
        .replace(/\{files\}/g, createHtmlFileList(locals.fileList, locals.directory))
        .replace(/\{directory\}/g, escapeHtml(locals.directory))
        .replace(/\{linked-path\}/g, htmlPath(locals.directory))
        .replace(/\{algolia-id\}/g, process.env.ALGOLIA_ID)
        .replace(/\{algolia-key\}/g, process.env.ALGOLIA_KEY)

      callback(null, body)
    })
  }
})


const rateLimiter = limiter({
  delay: 100,
  maxDelay: 1000,
  delayThreshold: 100,
  timeout: 60 * 1000
})

const server = http.createServer(async (req, res) => {
  await rateLimiter(req, res)
  const done = await handler(req, res)
  public(req, res, (err) => {
    if (err) return done(err)
    serve(req, res, (err) => {
      if (err) return done(err)
      index(req, res, done)
    })
  })
})

server.listen(process.env.PORT ? parseInt(process.env.PORT) : 3000, () => console.log('Server started'))
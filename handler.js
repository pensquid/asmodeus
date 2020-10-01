const onFinished = require('on-finished')
const statuses = require('statuses')
const getErrorPage = require('./getErrorPage')

const getErrorHeaders = (err) => {
  if (!err.headers || typeof err.headers !== 'object') {
    return undefined
  }

  const headers = {}
  for (let key of err.headers) {
    headers[key] = err.headers[key]
  }
  return headers
}

const getErrorStatusCode = (err) => {
  if (typeof err.status === 'number' && err.status >= 400 && err.status < 600) {
    return err.status
  }

  if (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600) {
    return err.statusCode
  }

  return undefined
}

const getResponseStatusCode = (res) => {
  let status = res.statusCode

  if (typeof status !== 'number' || status < 400 || status > 599) {
    status = 500
  }

  return status
}

const headersSent = (res) => typeof res.headersSent !== 'boolean'
  ? Boolean(res._header)
  : res.headersSent

const setHeaders = (res, headers) => {
  if (!headers) return

  for (let key in headers) {
    res.setHeader(key, headers[key])
  }
}

const send = (req, res, status, headers, message) => {
  const write = () => {
    const body = getErrorPage(status, req.url)

    res.statusCode = status
    res.statusMessage = statuses[status]

    setHeaders(res, headers)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'))

    if (req.method === 'HEAD') {
      res.end()
      return
    }

    res.end(body, 'utf8')
  }

  if (onFinished.isFinished(req)) {
    write()
    return
  }

  req.unpipe()

  onFinished(req, write)
  req.resume()
}

module.exports = (req, res, options) => (err) => {
  let headers
  let status

  if (!err && headersSent(res)) return

  if (err) {
    status = getErrorStatusCode(err)

    if (status === undefined) {
      status = getResponseStatusCode(res)
    } else {
      headers = getErrorHeaders(err)
    }
  } else {
    status = 404
  }

  if (headersSent(res)) {
    req.socket.destroy()
    return
  }

  send(req, res, status, headers)
}
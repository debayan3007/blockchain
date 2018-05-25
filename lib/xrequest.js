/**
 * xrequest - eXtended HTTP Request module
 *
 * ca projects uses this module to make all the
 * outbound http calls. all the calls are tracked
 * and persisted in physical storage for future analysis
 */

/**
 * Aim of this module is to make http calls more expressive
 * Example :-
 * RequestHelper
 * .url('http://something')
 * ._options('someProp', 'someVal')
 * ._options({ a: 'b', x: 'y' }) // object support
 * .jar(false) // other helpers
 * .proxy('http://proxyurl') // set proxy
 * .get() // or .post()
 * .then(fn) // finally
 * .catch() // catch it ;)
 */

const url = require('url')
const http = require('http')
const request = require('request')
// const systemDal = require('./data-access/system-dal')
// const RemoteSiteError = require('./errors/remote-site-error')

// const tracker = (options) => {
//   const { domain } = options
//   if (!domain) {
//     return
//   }
//   try {
//     systemDal.insertHit({
//       domain,
//       timestamp: +new Date(),
//     })
//   } catch (e) {}
// }

const keepAliveAgent = new http.Agent({ keepAlive: true })

const deepAssign = (target, ob) => {
  let key
  for (key in ob) {
    if (ob.hasOwnProperty(key)) {
      const val = ob[key]
      if (typeof target[key] !== 'object' && target[key]) {
        if (typeof val === 'object' && val) {
          target[key] = Object.assign({}, val)
        } else {
          target[key] = val
        }
      } else if (typeof val === 'object' && val && target[key]) {
        deepAssign(target[key], val)
      } else {
        target[key] = val
      }
    }
  }
  return target
}

const _make = (r, b) => {
  return Object.assign({
    content: b.toString(),
    rawContent: b,
    status: r.statusCode,
    type: r.headers['content-type'],
  }, r)
}

const blankFn = () => {}

const makeRequest = (options, resolve, reject, retryCount, retryFn, cCount = 0) => {
  /* Track requests if tracker present */
  const {allowStatus = []} = options

  request(options, (error, r, b) => {
    const e = error || (((r.statusCode / 100 << 0) !== 2 && !~allowStatus.indexOf(r.statusCode))
      ? Error(`Invalid status: ${r.statusCode}\nReceived: ${b.toString()}`) : null)
    if (e) {
      if (cCount >= retryCount) {
        reject(e)
      } else {
        retryFn(e, cCount + 1)
        makeRequest(options, resolve, reject, retryCount, retryFn, cCount + 1)
      }
    } else {
      resolve(_make(r, b))
    }
  })
}

class XRequest {
  constructor (url, isSecured = false, timeout = 120000) {
    this._options = {
      agent: isSecured ? undefined : keepAliveAgent,
      encoding: null,
      gzip: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
      },
      jar: true,
      timeout,
      url,
      // proxy: 'http://077b7ed23b874c56afd2736a179938b5:@proxy.crawlera.com:8010' ,
    }
    this._retry = 0
    this._retryFn = blankFn
  }
  /**
   * Set proxy url
   * @param {string} url
   */
  proxy (url) {
    this._options.proxy = url
    return this
  }

  /**
   * Initialize new instance of Request-Helper
   */
  static url (...params) {
    return new XRequest(...params)
  }

  /**
   * Set form data (takes either object or key value pair)
   * @param {*} key Object or string
   * @param {*} val
   */
  form (key, val) {
    const form = this._options.form || {}
    if (typeof key === 'object') {
      deepAssign(form, key)
    } else {
      form[key] = val
    }
    this._options.form = form
    return this
  }

  /**
   * Sets the number of retry
   * @param {*} count
   */
  retry (count) {
    this._retry = +count || 0
    return this
  }

  /**
   * Sets callback for retry mechanism
   * @param {*} fn
   */
  retryCallback (fn) {
    if (typeof fn === 'function') {
      this._retryFn = fn
    }
    return this
  }

  /**
   * Set headers of request (takes either object or key value pair)
   * @param {*} key
   * @param {*} val
   */
  headers (key, val) {
    const headers = this._options.headers || {}
    if (typeof key === 'object') {
      deepAssign(headers, key)
    } else {
      headers[key] = val
    }
    this._options.headers = headers
    return this
  }

  /**
   * Add a cookie string to current cookie string
   */
  addCookie (val) {
    this._options.headers.Cookie = this._options.headers.Cookie || ''
    this._options.headers.Cookie += ';' + String(val)
    return this
  }

  /**
   * Override current cookie value
   * @param {*} val
   */
  setCookie (val) {
    this._options.headers.Cookie = String(val)
    return this
  }

  /**
   * Same as setCookie
   * @param {*} params
   */
  cookie (...params) {
    this.setCookie(...params)
    return this
  }

  /**
   * Set highest level of options of request
   * (takes either object or key value pair)
   * @param {*} key
   * @param {*} val
   */
  options (key, val) {
    if (typeof key === 'object') {
      deepAssign(this._options, key)
    } else {
      this._options[key] = val
    }
    return this
  }

  /**
   * Set jar enabled or disabled; Default enabled
   * @param {Boolean} val
   */
  jar (val) {
    this._options.jar = !!val
    return this
  }

  /**
   * Set followRedirects
   * @param {Boolean} val
   */
  follow (val) {
    if (val) {
      this._options.followRedirects = true
    }
    return this
  }

  /**
   * Set status code to be allowed
   * @param {Boolean} val
   */
  allow (val) {
    this._options.allowStatus = this._options.allowStatus || []
    this._options.allowStatus.push(val)
    return this
  }

  /**
   * Make get request with current options
   * @returns Promise
   */
  get () {
    const { _options } = this
    return new Promise((resolve, reject) => {
      makeRequest(_options, resolve, reject, this._retry, this._retryFn)
    })
  }

  /**
   * Make post request with current options
   * @returns Promise
   */
  post () {
    const { _options } = this
    return new Promise((resolve, reject) => {
      _options.method = 'POST'
      makeRequest(_options, resolve, reject, this._retry, this._retryFn)
    })
  }

  put () {
    const { _options } = this
    return new Promise((resolve, reject) => {
      _options.method = 'PUT'
      makeRequest(_options, resolve, reject, this._retry, this._retryFn)
    })
  }

  delete () {
    const { _options } = this
    return new Promise((resolve, reject) => {
      _options.method = 'DELETE'
      makeRequest(_options, resolve, reject, this._retry, this._retryFn)
    })
  }
}

module.exports = XRequest

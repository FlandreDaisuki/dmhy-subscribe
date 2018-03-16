// From https://stackoverflow.com/a/31090384
class ExtendableError extends Error {
  constructor (message) {
    super()
    this.message = message
    this.stack = (new Error()).stack
    this.name = this.constructor.name
  }
}

class InvalidThreadError extends ExtendableError {
  constructor (msg = 'Invalid thread') {
    super(msg)
  }
}

module.exports = {
  InvalidThreadError
}

// From https://stackoverflow.com/a/31090384

/**
 * @class ExtendableError
 * @extends {Error}
 */
class ExtendableError extends Error {
  /**
   * Creates an instance of ExtendableError.
   * @param {any} message
   * @memberof ExtendableError
   */
  constructor(message) {
    super();
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
}

/**
 * @class SubscriptionError
 * @extends {ExtendableError}
 */
class SubscriptionError extends ExtendableError {
  /**
   * Creates an instance of SubscriptionError.
   * @param {any} msg
   * @memberof SubscriptionError
   */
  constructor(msg) {
    super(msg);
  }
}

/**
 * @class ThreadError
 * @extends {ExtendableError}
 */
class ThreadError extends ExtendableError {
  /**
   * Creates an instance of ThreadError.
   * @param {any} msg
   * @memberof ThreadError
   */
  constructor(msg) {
    super(msg);
  }
}

module.exports = {
  SubscriptionError,
  ThreadError,
};

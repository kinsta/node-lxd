/**
 *     __   _  __ ____
 *    / /  | |/ // __ \
 *   / /   |   // / / /
 *  / /___/   |/ /_/ /
 * /_____/_/|_/_____/
 *
 * @author Alan Doherty (BattleCrate Ltd.)
 * @license MIT
 */

// requires
var utils = require('../utils');
var WebSocket = require('ws');
var extend = require('util')._extend;

// client
var Operation = utils.class_('Operation', {
  /**
   * @private
   */
  _client: null,

  /**
   * @private
   */
  _started: false,

  /**
   * @private
   */
  _metadata: {},

  /**
   * Gets the metadata for this operation.
   * @returns {object}
   */
  metadata: function() {
    return this._metadata;
  },

  /**
   * Gets the id of the operation.
   * @returns {string}
   */
  id: function() {
    return this._metadata.id;
  },

  /**
   * Gets the class of operation.
   * @returns {string}
   */
  class: function() {
    return this._metadata.class;
  },

  /**
   * Gets the status or error.
   * @returns {string}
   */
  status: function() {
    return this._metadata.status;
  },

  /**
   * Gets the status code.
   * @returns {number}
   */
  statusCode: function() {
    return this._metadata.status_code;
  },

  /**
   * Gets if the operation has started.
   * @returns {boolean}
   */
  hasStarted: function() {
    return this._started;
  },

  /**
   * Connects to the websocket of this operation (if available).
   * @param {string} secret
   * @param {function} callback
   * @returns {object|null}
   */
  webSocket: function(secret, callback) {
    if (this.class() == 'websocket') {
      // try and connect

      let options = {};
      if (this._client._key && this._client._cert) {
        options = {
          key: this._client._key,
          cert: this._client._cert,
          rejectUnauthorized: false
        }
      }

      var ws = new WebSocket(
        this._client._wsPath + '1.0/operations/' + this.id() +
        '/websocket?secret=' + secret, options);

      // hook onto events
      ws.on('unexpected-response', (req, res) => { 
        res.on('data', (responseBody) => callback(new Error(responseBody.toString('utf8'))))
      })
      
      ws.on('error', function(err) {
        callback(err);
      });

      ws.on('open', function() {
        callback(null, ws);
      });

      return ws;
    } else {
      callback(new Error('The operation is not of websocket class'));
      return null;
    }
  },

  /**
   * Processes the JSON data into the operation.
   * @param {object} data
   * @internal
   */
  _process: function(data) {
    // type
    this._started = true;
    this._metadata = data.metadata;
  },

  /**
   * Creates an operation.
   * @param {Client} client
   */
  constructor: function(client) {
    this._client = client;
    this._started = false;
    this._metadata = {};
  },
});

// export
module.exports = Operation;

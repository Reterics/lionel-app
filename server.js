'use strict';
const { enableSTDIN } = require('./bin/initServer');
const { liveUpdate } = require('./constants');

const { initServer } = require('./bin/initServer');
const { parseArguments } = require('./bin/appMethods');

// eslint-disable-next-line no-undef
const FM = require('./bin/fileManager.js').FM;
FM._validateAppData();

/**
 * Init global Lionel Object
 * @type {{methods, startup, Router, templateManager}}
 */
const Lionel = require('./bin/LionelClass').Lionel;
require('./app/routes');
console.log(Lionel && Lionel.templateManager ? 'Lionel object loaded...' : 'Unknown error in Lionel Object');

if (liveUpdate) {
	enableSTDIN(Lionel);
}
/**
 * Start HTTP/HTTS Server
 * @type {Array|*}
 */
initServer(parseArguments());

/**
 * Initialize backend
 **/
require('./app/server/main');
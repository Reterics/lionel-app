'use strict';
const { enableSTDIN } = require('./bin/initServer');
const { initServer } = require('./bin/initServer');
const { jsFolder } = require("./constants");
const { viewFolder } = require("./constants");
const { libFolder, port } = require("./constants");
const { TemplateManagerBaseCore } = require("./bin/templateManager");

// eslint-disable-next-line no-undef
const FM = require('./bin/fileManager.js').FM;
FM._validateAppData();

/**
 * Init global Lionel Object
 * @type {{methods, startup, Router, templateManager}}
 */
const Lionel = require('./bin/LionelClass').Lionel;

/**
 * Initialize TemplateManager
 * @type {TemplateManagerBaseCore|*}
 */
Lionel.templateManager = new TemplateManagerBaseCore({
	lib: libFolder, // Importable files for require statements
	//global: globalsJS, // global/window functions/values
	view: viewFolder, // HTML files
	js: jsFolder, // onload/onrendered javascript files
	debug: true
});

if (FM.fileExistsSync('./app/routes')) {
	require('./app/routes');
}
console.log(Lionel && Lionel.templateManager ? 'Lionel object loaded...' : 'Unknown error in Lionel Object');

const { liveUpdate } = require('./constants');
if (liveUpdate) {
	enableSTDIN(Lionel,libFolder,jsFolder);
}
/**
 * Start HTTP/HTTS Server
 * @type {Array|*}
 */
initServer(port);

/**
 * Initialize backend
 **/
require('./app/server/main');
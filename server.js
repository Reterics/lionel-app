'use strict';
const { initLionelServer } = require('./bin/initLionelServer');
const { jsFolder, viewFolder, libFolder, port, liveUpdate, mainDirectory, separator, appData, appName} = require("./constants");

const { app } = require('./app');
/**
 * Start HTTP/HTTS Server
 * @type {Array|*}
 */
initLionelServer(port,{
	appData: appData,
	appName: appName,
	lib:libFolder,
	view:viewFolder,
	js:jsFolder,
	debug:true,
	liveUpdate:liveUpdate,
	mainDirectory:mainDirectory,
	separator:separator,
	requestListener:app
});

/**
 * Initialize backend
 **/
require('./app/server/main');

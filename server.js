'use strict';
const { initLionelServer } = require('./bin/initLionelServer');
const { jsFolder, viewFolder, libFolder, port, liveUpdate, mainDirectory, separator, appData, appName } = require('./constants');

const { app } = require('./app');
/**
 * Start HTTP/HTTS Server
 * @type {Array|*}
 */
initLionelServer(port, {
	appData: appData,
	appName: appName,
	lib: libFolder,
	view: viewFolder,
	js: jsFolder,
	debug: true,
	liveUpdate: liveUpdate,
	mainDirectory: mainDirectory,
	separator: separator,
	requestListener: app,
	db: [
		{
			type: 'mysql',
			host: 'localhost',
			database: 'angel',
			port: 3306,
			username: 'root',
			password: ''
		},
		{
			type: 'mongodb',
			host: 'localhost',
			database: 'collection',
			username: '',
			password: '',
			port: 27017,
		}
	]
});

/**
 * Initialize backend
 **/
require('./app/server/main');

'use strict';
const { initLionelServer } = require('./bin/initLionelServer');
const { jsFolder, viewFolder, libFolder, port, mainDirectory, separator, appData, appName } = require('./constants');

/**
 * Start Lionel-App server to make a build for your PHP server
 * @type {Array|*}
 */
initLionelServer(port, {
	appData: appData,
	appName: appName,
	lib: libFolder,
	view: viewFolder,
	js: jsFolder,
	debug: true,
	mainDirectory: mainDirectory,
	separator: separator,
	phpExport: './htdocs/',
	db: [
		{
			type: 'mysql',
			host: 'localhost',
			database: 'angel',
			port: 3306,
			username: 'root',
			password: ''
		}
	]
});

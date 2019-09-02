'use strict';
const { parseArguments, getArgumentValue } = require("./appMethods");
const FM = require('./fileManager').FM;

/**
 *
 * @param {string|number} val
 * @returns {boolean|number|*}
 */
const normalizePort = function (val) {
	const port = parseInt(val, 10);
	if (isNaN(port)) {
		return val;
	}
	if (port >= 0) {
		return port;
	}
	return false;
};

/**
 * Determine of the type of HTTP server and returns the server instance
 * @param {array} argumentList
 */
const getServerInstance = function (argumentList) {
	const { app } = require('../app');

	const certificateKey = getArgumentValue('key', argumentList);
	const certificateCert = getArgumentValue('cert', argumentList) + '';
	const serverType = certificateCert && certificateKey && FM.fileExists(certificateKey) && FM.fileExists(certificateCert) ? 'https' : 'http';

	let server;
	if (serverType === 'https' && typeof certificateKey === 'string' && typeof certificateCert === 'string') {
		const https = require('https');
		const fs = require('fs');

		const options = {
			key: fs.readFileSync(certificateKey),
			cert: fs.readFileSync(certificateCert),
			requestCert: false,
			rejectUnauthorized: false
		};
		server = https.createServer(options, app);
	} else {
		const http = require('http');
		server = http.createServer(app.listen);
	}
	return server;
};
/**
 * If the HTTP server started running, this function starts and tell us through console
 */
const onListening = function () {
	if (this && typeof this.address === 'function') {
		const address = this.address();
		const bind = typeof address === 'string'
			? 'pipe ' + address
			: 'port ' + address.port;
		console.log('Listening on ' + bind);
	} else {
		console.log('Listening...');
	}
};

let errorCounter = 0;
/**
 * This function handles the error of HTTP Server
 * @param {Error} error
 * @param {number} port
 */
const onServerError = function (error, port) {
	const server = this && typeof this.address === 'function' ? this : null;
	if (error.syscall !== 'listen') {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(port + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			if (errorCounter === 0) {
				console.error('Post is already in use. Waiting...');
				errorCounter++;
			}
			waitForPort.call(server, port);
			// process.exit(1);
			break;
		default:
			throw error;
	}
};

/**
 * If the specific port are not open or reserved already, the server will be waiting until it will be free
 * @param {number} port
 */
function waitForPort (port) {
	const server = this && typeof this.address === 'function' ? this : null;
	if (errorCounter > 600) {
		console.error('Timeout');
		process.exit(1);
	}
	setTimeout(function () {
		server.listen(port);
	}, 1000);
}

/**
 * Initialize the HTTP Web Server
 */
const initServer = function (port) {
	const argumentList = parseArguments();
	process.env.PORT = getArgumentValue('port', argumentList) || port;
	const normalizedPort = normalizePort(process.env.PORT);

	const server = getServerInstance(argumentList);

	server.on('error', function (error) {
		onServerError.call(this, error, normalizedPort);
	});
	server.on('listening', onListening);

	server.listen(normalizedPort);
	console.log('Server is Ready');
};
/**
 * This function enables the live update for development
 * @param Lionel
 * @param libFolder
 * @param jsFolder
 */
const enableSTDIN = function (Lionel,libFolder,jsFolder) {
	process.stdin.resume();
	process.stdin.on('data', function () {
		if (Lionel.templateManager._lastUpdated) {
			const jsList = FM.fileStatsRecursive(jsFolder, null);
			// const viewList = FM.fileStatsRecursive(viewFolder,null);
			const libList = FM.fileStatsRecursive(libFolder, null);

			const time = Lionel.templateManager._lastUpdated;

			const jsKeys = Object.keys(jsList);
			// const viewKeys = Object.keys(viewList); // soon
			const libKeys = Object.keys(libList);

			let needUpdate = false;
			libKeys.forEach(lib => {
				if (libList[lib] > time) {
					console.log(lib + 'is updated');
					needUpdate = true;
				}
			});

			if (needUpdate) {
				Lionel.templateManager.loadControllers(libList);
			} else {
				jsKeys.forEach(js => {
					if (jsList[js] > time) {
						console.log(js + 'is updated');
						Lionel.templateManager.loadOneClientFile(js);
						needUpdate = true;
					}
				});
				if (!needUpdate) {
					console.log('No need to update. If you edited file, please make a CTRL+S on it or restart the server.');
				}
			}
		}
	});
};

module.exports = { initServer, enableSTDIN };

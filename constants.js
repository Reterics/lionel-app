'use strict';
/**
 * Init Constants
 */
const path = require('path');
const separator = __dirname.indexOf('/') !== -1 ? '/' : '\\';
const negatedSeparator = __dirname.indexOf('/') === -1 ? '/' : '\\';
const mainDirectory = __dirname.split('bin')[0].toString();

/**
 * Name of the Application
 * (Folder name compatible version of your application name)
 * @type {string}
 */
const appName = 'LionelFramework';
const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME : '/var/local');

/**
 * Application Data Folder of Application
 * @type {string}
 */
const appFolder = mainDirectory + separator + 'app' + separator;
/**
 * Filename of the Global file. It contains the Lionel object for the frontend, what communicates with the server,
 * and every other global variable and function
 * @type {string}
 */
const globalsJS = appFolder + 'globals.js';
/**
 * Library/Imports folder
 * .
 * You can put functions/objects in javascript files what are exported with modules.exports = {}
 * Files in this folder can be imported in client-side files too for the browser
 * @type {string}
 */
const libFolder = appFolder + 'lib' + separator;
/**
 * View folder
 * .
 * Contains every HTML "template" for the browser
 * @type {string}
 */
const viewFolder = appFolder + 'views' + separator;
/**
 * Javascript Folder
 * .
 * Contains onLoad(onRendered) javascript files for the HTML "templates".
 * Index.js will load when index.html is loaded in the browser
 * Javascript folder and View folder can be the same.
 * @type {string}
 */
const jsFolder = viewFolder;
/**
 * Public folder
 * .
 * Public folder stores the static files in the web storage. This folder be able to use as a sample web-server
 * @type {string}
 */
const publicFolder = appFolder + 'public' + separator;
/**
 * Path for the favicon image
 * @type {string}
 */
const faviconImage = path.join(mainDirectory, 'favicon.ico');
const debugMode = true;
const liveUpdate = true;

/**
 * The port for your web-server
 * @type {string}
 */
const port = '8080';

module.exports = {
	appFolder,
	globalsJS,
	libFolder,
	viewFolder,
	jsFolder,
	publicFolder,
	appName,
	separator,
	mainDirectory,
	appData,
	faviconImage,
	port,
	debugMode,
	liveUpdate,
	negatedSeparator
};

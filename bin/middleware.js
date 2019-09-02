'use strict';
const { checkFile } = require('./mimeTypes');
const { separator } = require('../constants');
const { FM } = require('./fileManager');

/**
 * This function is a middleware to server static files in a specific folder like a web server
 * @param publicFolder
 * @returns {function(*, *, *): *}
 */
const serverStatic = function (publicFolder) {
	const path = require('path');
	return function (req, res, next) {
		const parsedURL = req.url.replace(new RegExp('/', 'g'), separator);
		const filePath = path.join(publicFolder, parsedURL);
		if (FM.fileExistsSync(filePath) && filePath.includes('.')) {
			console.log('File found: ' + filePath);
			const contentType = checkFile(filePath) || 'text/plain';
			res.setHeader('Content-Type', contentType);
			res.send(FM.read(filePath)); // This is a blocking operation, should i change?
			return;
		}
		return next();
	};
};
/**
 * This is the simple middleware what manage middleware applications like the Express JS, just less functionality
 * @returns {lionelMiddleware|{}}
 */
const lionelMiddleware = function () {
	const middlewareList = [];
	const self = this || {};

	/**
	 * We can add middleware function with this method
	 * @param method
	 */
	self.use = function (method) {
		if (typeof method === 'function') {
			middlewareList.push(method);
		}
	};

	/**
	 * This function extends the response object, because it doesnt contain send function by default
	 * @param res
	 */
	const apply = function (res) {
		if (typeof res === 'object') {
			if (typeof res.send !== 'function') {
				res.send = function (content) {
					res.write(content);
					res.end();
				};
			}
		}
	};

	self.listen = function (req, res) {
		const closeResponse = function () {
			if (typeof res.end === 'function') {
				res.end();
			}
		};
		apply(res);
		if (!middlewareList.length) {
			closeResponse();
			return;
		}

		let currentIndex = -1;
		const lastIndex = middlewareList.length - 1;

		/**
		 * This function runs the middleware function after each other. If one function calls the next(), then
		 * we try to call the following one. In the end we close the response if there is no more middleware function
		 */
		const next = () => {
			if (currentIndex < lastIndex) {
				currentIndex++;
				middlewareList[currentIndex](req, res, next);
			} else {
				closeResponse();
			}
		};
		next();
	};
	return self;
};

module.exports = {
	lionelMiddleware,
	serverStatic,
};

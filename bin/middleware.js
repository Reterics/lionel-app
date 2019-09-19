'use strict';
const { Lionel } = require('./LionelClass');
const { errorHandling } = require('./requestManager');
const { postCall } = require('./requestManager');
const { checkFile } = require('./mimeTypes');
const { FM } = require('./fileManager');

/**
 * This function is a middleware to server static files in a specific folder like a web server
 * @param publicFolder
 * @returns {function(*, *, *): *}
 */
const serverStatic = function (publicFolder) {
	const path = require('path');
	return function (req, res, next) {
		const parsedURL = (req.url || '').replace(new RegExp('/', 'g'), FM.separator);
		const filePath = path.join(publicFolder, parsedURL);
		if (FM.fileExistsSync(filePath) && filePath.includes('.')) {
			console.log('File found: ' + filePath);
			const contentType = checkFile(filePath) || 'text/plain';

			const fs = require('fs');
			const stream = fs.createReadStream(filePath);
			stream.on('open', function () {
				res.setHeader('Content-Type', contentType);
				stream.pipe(res);
			});
			stream.on('error', function () {
				res.setHeader('Content-Type', 'text/plain');
				res.statusCode = 404;
				res.end('Not found');
			});
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
	 * Support GET middleware for a specific URL
	 * @param {string} url
	 * @param {function} method
	 */
	self.post = function (url, method) {
		if (typeof method === 'function') {
			const postMethod = function (req, res, next) {
				if (req && req.method === 'POST' && req.url.split('?')[0] === url) {
					method(req, res, next);
				} else if (typeof next === 'function') {
					next();
				} else {
					req.end();
				}
			};
			middlewareList.push(postMethod);
		}
	};

	/**
	 * Support GET middleware for a specific URL
	 * @param {string} url
	 * @param {function} method
	 */
	self.get = function (url, method) {
		if (typeof method === 'function') {
			const getMethod = function (req, res, next) {
				if (req && req.method === 'GET' && req.url.split('?')[0] === url) {
					method(req, res, next);
				} else if (typeof next === 'function') {
					next();
				} else {
					req.end();
				}
			};
			middlewareList.push(getMethod);
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
	self.isLionel = true;

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
/**
 * Middleware function what enabled LionelClient.call connections with the server
 * @param req
 * @param res
 */
const lionelCallMiddle = function (req, res) {
	if (req.method === 'GET' && req.url === '/call') {
		res.redirect('/');
	} else if (req.method === 'POST' && req.url === '/call') {
		postCall(req, res);
	} else if (!req.url || !Lionel.Router.handleRequest(req.url, res)) {
		errorHandling(req, res);
	}
};

module.exports = {
	lionelMiddleware,
	serverStatic,
	lionelCallMiddle
};

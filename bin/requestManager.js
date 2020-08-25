'use strict';
const Lionel = require('./LionelClass').Lionel;
const Router = Lionel.Router;

/**
 * @param {object} req
 * @return {(string|Array)}
 */
function getBodyArguments (req) {
	if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
		return req.body.content;
	} else if (req.headers['content-type'] === 'application/json') {
		return req.body.arguments;
	}
	return '';
}

const resultCache = {};
/**
 * @param {(Array||string)} content
 * @param {object} user
 * @param {Object} res : Response
 * @param {function} res.send
 * @param {function} res.setHeader
 */
function getTemplate (content, user, res) {
	let result;
	content = (typeof content === 'object' ? content[0] : content).toString();
	if (content.includes('%')) {
		content = decodeURI(content);
	}
	if (Router.templateExists(content)) {
		content = [Router.checkRoute(content)];
		result = Lionel._methods.__getRenderedTemplate.apply(user, content);
	} else {
		result = { html: '<h1 style="margin-top:60px">404 Not Found</h1>', onRendered: undefined };
	}
	resultCache[content] = result;
	handleResult(result, res);
}

/**
 *
 * @param {(Promise|Object|string||undefined||number)} result : String .This is what Lionel.call will get and Lionel methods return
 * @param {Object} res : Response
 * @param {function} res.send
 * @param {function} res.setHeader
 */
function handleResult (result, res) {
	res.setHeader('Content-Type', 'text/plain');
	if (result instanceof Promise) {
		result.then(function (data) {
			res.send(data);
		}).catch(function () {
			res.send('<h1 style="margin-top: 60px">500 - Error in Processing request</h1>');
		});
	} else if (typeof result === 'object') {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(result));
	} else {
		if (result && typeof result !== 'string') {
			result = result.toString();
		}
		res.send(result);
	}
}

/**
 * Lionel Call init middleware function
 * @param {Object} req : Request
 * @param {Object} res : Response
 * @param {function} res.send
 * @param {function} res.setHeader
 */
const postCall = function (req, res) {
	const method = req.body.method;
	const content = getBodyArguments(req);

	if (typeof Lionel._methods[method] !== 'undefined') {
		const user = req.user ? {
			username: req.user.username,
			email: req.user.email,
			permission: req.user.permission,
			_id: req.user._id,
		} : {};

		if (method === '__getRenderedTemplate') {
			if (resultCache[content]) {
				handleResult(resultCache[content], res);
			} else {
				getTemplate(content, user, res);
			}
		} else {
			let result;
			if (req.headers['content-type'] === 'application/json') {
				result = Lionel._methods[method].apply(user, content);
				res.setHeader('Content-Type', 'application/json');
				if (result === undefined) {
					result = { status: undefined };
					res.send(JSON.stringify(result));
				} else if (result instanceof Promise) {
					result.then(function (data) {
						if (typeof data === 'string') {
							res.send(data);
						} else if (typeof data === 'number') {
							res.send(data.toString());
						} else {
							res.send(JSON.stringify(data));
						}
					}).catch(function () {
						res.setHeader('Content-Type', 'text/plain');
						res.send('<h1 style="margin-top: 60px">500 - Error in Processing request</h1>');
					});
				} else if (typeof result === 'string') {
					res.send(result);
				} else if (typeof result === 'number') {
					res.send(result.toString());
				} else {
					res.send(JSON.stringify(result));
				}
				return;
			} else {
				result = Lionel._methods[method].call(user, content);
			}
			handleResult(result, res);
		}
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.send('{\'status\': \'Method is not found\'}');
	}
};

/**
 * @param req
 * @param {Object} res : Response
 * @param {function} res.send
 * @param {function} res.setHeader
 */
const errorHandling = function (req, res) {
	const err = { status: 404, locals: { message: 'Not Found', error: {} }, message: 'Not Found' };

	if (!res.locals) {
		res.locals = {};
	}
	res.locals.message = err.message;
	res.locals.error = err;

	if (req.url === '/call') {
		res.setHeader('Content-Type', 'application/json');
		const result = { status: 'undefined', error: true, details: { message: err.message, url: req.url } };
		res.send(result);
		return;
	}
	Lionel.templateManager.renderTemplate('__html', { template: 'error' }, res);
};

module.exports = { postCall, errorHandling };

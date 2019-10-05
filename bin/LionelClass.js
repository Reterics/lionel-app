'use strict';
const { publicFolder } = require('../constants');

const FM = require('./fileManager.js').FM;
const path = require('path');

/**
 * This function look for a javascript file in the /app/public/js and the /app/public/ folder with the
 * specified name, and returns the content of the file
 * @param {string} name
 * @returns {string|*|string}
 */
const getLib = (name) => {
	const publicFolder = '.' + FM.separator + 'app' + FM.separator + 'public' + FM.separator;
	const publicJS = path.resolve(publicFolder + 'js' + FM.separator + name + '.js');
	const publicGlobal = path.resolve(publicFolder + name + '.js');

	if (FM.fileExistsSync(publicJS)) {
		return FM.read(publicJS);
	} else if (FM.fileExistsSync(publicGlobal)) {
		return FM.read(publicGlobal);
	} else if (FM.fileExistsSync(publicFolder + 'js' + FM.separator + name + '.js')) {
		return FM.read(publicFolder + 'js' + FM.separator + name + '.js');
	} else {
		return '/*File not found: ' + name + '*/';
	}
};

/**
 * @typedef LionelObject
 */
const Lionel = {
	templateManager: null,
	_methods: {
		__getRenderedTemplate: function (templateName) {
			if (Lionel.templateManager && typeof Lionel.templateManager.renderTemplate === 'function') {
				return Lionel.templateManager.renderTemplate(templateName, {}, undefined);
			} else {
				console.error('TemplateManager is not loaded yet');
				return false;
			}
		},
		__getPublicJS: function (name) {
			if (name && name.indexOf(';') !== -1) {
				const pieces = name.split(';');
				let output = '';
				pieces.forEach(function (name) {
					output += '\r\n' + getLib(name);
				});
				return output;
			}
			return getLib(name);
		},
		mysql: function (queryType, query) {
			if (!Lionel.DB || !Lionel.DB.mysql || !Lionel.DB.mysql._handleQuery) {
				return 'There is no valid DB connected with this details to Lionel-App';
			}
			return Lionel.DB.mysql._handleQuery(queryType, query);
		},
		mongodb: function (queryType, query) {
			if (!Lionel.DB || !Lionel.DB.mongodb || !Lionel.DB.mongodb._handleQuery) {
				return 'There is no valid DB connected with this details to Lionel-App';
			}
			return Lionel.DB.mongodb._handleQuery(queryType, query);
		}
	},
	_innerMethods: {
		startup: function () {
		}
	},
	methods: function (object) {
		if (typeof object === 'object') {
			const keys = Object.keys(object);
			keys.forEach(key => {
				if (typeof object[key] === 'function') {
					this._methods[key] = object[key];
				}
			});
		}
	},
	startup: function (method) {
		if (typeof method === 'function') {
			this._innerMethods.startup = method;
		}
	},
	/**
	 * @type LionelRouter
	 */
	Router: {
		routes: {},
		resFolder: publicFolder,
		currentTemplate: '',
		route: function (url, callback) {
			if (typeof url !== 'string') {
				return;
			}
			if (url.charAt(0) === '/') {
				url = url.substring(1);
			}
			if (url.indexOf('-:') !== -1) {
				url = url.split('-')[0];
			} else if (url.indexOf(':') !== -1) {
				url = url.split(':')[0];
			}
			const self = this;
			if (typeof callback === 'function' && url) {
				self.routes[url] = callback;
			} else if (typeof callback === 'string') {
				self.routes[url] = function () {
					self.render(callback);
				};
			} else if (!callback) {
				self.routes[url] = function () {
					self.render(url);
				};
			}
		},
		checkRoute: function (url, callback) {
			// callback for the result
			if (url.charAt(0) === '/') {
				url = url.substring(1);
			}
			if (url === '') url = 'index';
			if (url === 'logout') url = 'login';
			if (url.includes('?')) {
				url = url.split('?')[0];
			}
			let templateName;
			if (typeof this.routes[url] === 'function') {
				this.routes[url].apply(this, []);
				templateName = this.currentTemplate;
			} else if (url === 'index') {
				templateName = url; // Patch: dont use every template
			}
			if (typeof callback === 'function') {
				callback(templateName);
			}
			return templateName;
		},
		templateExists: function (templateName) {
			if (typeof templateName === 'string') {
				if (templateName.includes('%')) {
					templateName = decodeURI(templateName);
				}
				templateName = this.checkRoute(templateName);
			}
			return templateName && Lionel.templateManager && typeof Lionel.templateManager._templates[templateName] !== 'undefined';
		},
		render: function (templateName) {
			this.currentTemplate = templateName;
			return templateName;
		},
		isSecureConsole: function (url, res) {
			if (url.indexOf('console/') !== -1) {
				const name = url.split('console/')[1].toString();
				if (this.templateExists(name)) {
					const templateName = this.checkRoute('/' + name);
					let data = Lionel.templateManager.renderTemplate(templateName, {}, undefined);
					if (data.onRendered) {
						data = data.onRendered;
					}
					data = 'global._onRendered_' + name + '=function(c){window.LionelError = "";Lionel._pageOnRendered();try{\n' + data + '\n}catch(e){LionelError = e;}if(typeof c === "function"){c(LionelError)};};Lionel._scriptOnRendered(window.LionelError,"_onRendered_' + name + '");';
					res.setHeader('Content-Type', 'application/javascript');
					// res.type('application/javascript');
					res.send(data);
					return false;
				}
			}
			return true;
		},
		handleRequest: function (url, res) {
			if (this.debug) console.log('Check URL: ' + url);
			let path = url.substring(1) || '';
			if (path.includes('%')) {
				path = decodeURI(path);
			}
			if (this.templateExists(path)) {
				const templateName = this.checkRoute(path);
				Lionel.templateManager.renderTemplate('__html', { template: templateName }, res);
				return true;
			}
			return !this.isSecureConsole(url, res);
		}
	},
	debug: false,
	DB: {

	}
};

module.exports = { Lionel };

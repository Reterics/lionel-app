'use strict';
const Lionel = {
	/**
     * @param args
     * @returns {*|Promise<any>}
     */
	call: function (...args) {
		let i = 1;
		const isThereCallback =  typeof args[args.length - 1] === 'function';
		let lastArgument = isThereCallback ? args.length - 1 : args.length;
		if (args.length === 0 || typeof args[0] !== 'string') {
			if (isThereCallback) {
				args[0](true, 'At least one parameters are needed for call');
			}
			return new Promise((resolve, reject) => {
				reject(new Error( 'At least one parameters are needed for call'));
			});
		}
		const functionName = args[0];
		const callback = isThereCallback ? args[lastArgument] : null;

		const params = [];
		for (i; i < lastArgument; i++) {
			params.push(args[i]);
		}

		return this._xmlHTTPRequest({
			callback: callback, // error result
			call: '/call',
			method: 'POST',
			'content-type': 'application/json',
			functionName: functionName,
			parameters: params,
		});
	},
	/**
	 * This function makes a Rest API Request to the server with the specific parameters to help server to recognize the client
     * @param {Object} options
     * @param {string} options.url
     * @param {string} options.method
     * @param {string} options.functionName
     * @param {string[]} options.parameters
     * @param {function|undefined} options.callback
     * @returns {Promise<any>}
     * @private
     */
	_xmlHTTPRequest: function (options) {
		if (!options) options = {};
		const xHTTP = new XMLHttpRequest();
		const call = typeof options.url === 'string' ? options.url : '/call';
		const method = typeof options.method === 'string' ? options.method : 'POST';
		const content = typeof options['content-type'] === 'string' ? options['content-type'] : 'application/json';

		const forSend = {};
		forSend.method = options.functionName || '';
		forSend.arguments = options.parameters || [];
		const statusError = { message: 'You lost connection with the server', url: options.functionName };

		return new Promise((resolve, reject) => {
			xHTTP.onreadystatechange = function () {
				let error = true;
				if (this.readyState === 4 && this.status === 200) {
					error = false;
				} else if (this.readyState === 4) {
					if (typeof options.callback === 'function') {
						options.callback(true, statusError);
					}
					reject(statusError);
					return;
				}
				if (this.readyState === 4) {
					let response = xHTTP.response;
					try {
						response = JSON.parse(xHTTP.response);
					} catch (e) {
						console.error(e);
					}
					if (error || (response && response.status && response.status === 'undefined')) {
						if (response.error === true) {
							error = true;
						}
						if (typeof options.callback === 'function') {
							options.callback(error, undefined);
						}
						reject(response);
					} else {
						if (typeof options.callback === 'function') {
							options.callback(error, response);
						}
						resolve(response);
					}
				}
			};

			xHTTP.open(method, call, true);
			xHTTP.setRequestHeader('Content-type', content);

			try {
				xHTTP.send(JSON.stringify(forSend));
			} catch (e) {
				if (typeof options.callback === 'function') {
					options.callback(true, statusError);
				}
				reject(statusError);
			}
		});
	},
	/**
	 * We can load external javascript libraries through this Javascript function.
	 * This is a god async way the save network traffic
     * @param {string} name
     * @param {function|undefined} then
     * @returns {Promise<any>}
     */
	getPublicJS: function (name, then) {
		if (Array.isArray(name)) {
			name = name.join(';');
		} else if (typeof name === 'number') {
			name = name.toString();
		}

		return new Promise((resolve, reject) => {
			if (typeof name !== 'string') {
				reject(new Error('There is no name'));
			}
			let isDone = false;
			const n = name.split(';')[0];

			const callback = (error, result) => {
				if (!isDone) {
					isDone = true;
					if (typeof then === 'function') {
						then(result);
					}
					if (error) {
						reject(new Error(error));
					} else {
						resolve(result);
					}
				}
			};
			function _checkLib () {
				const node = document.querySelector('#externalLib' + n);
				if (node) {
					if (window[n]) {
						return window[n];
					} else {
						return _errorLib();
					}
				} else {
					return _errorLib();
				}
			}
			function _errorLib () {
				setTimeout(function () {
					if (!window[n]) {
						window[n] = function () {
							console.error('Libary is Not found: ' + name);
						};
					} else {
						callback(false, window[n]);
					}
				}, 1000);
				return null;
			}
			const createScript = function (name, html) {
				const script = document.createElement('script');
				script.type = 'text/javascript';
				script.id = 'externalLib' + name;
				script.innerHTML = html;
				// document.querySelector('body').appendChild(script);
				document.body.appendChild(script);
			};
			function _getLib () {
				Lionel.call('__getPublicJS', name, function (error, result) {
					if (!error) {
						const node = document.querySelector('#externalLib' + n);
						if (!node) {
							if (name && name.indexOf(';') !== -1) {
								name.split(';').forEach(function (name, i) {
									console.log(name);
									if (!i) {
										createScript(name, result);
									} else {
										createScript(name, '//Placeholder, script is already loaded');
									}
								});
							} else {
								createScript(name, result);
							}
						}

						setTimeout(_statement, 30);
					}
				});
			}

			function _statement (getLib) {
				const lib = _checkLib();
				if (lib) {
					callback(false, lib);
				} else {
					if (getLib) {
						getLib();
					}
				}
			}
			_statement(_getLib());
		});
	},
	callList: {},
	/**
     * You can use this function if you want to get HTML and JS data from a specific URL/file
     * @param {String} name
     * @returns {Promise<any>}
     */
	getPageContent: function (name) {
		return new Promise((resolve, reject) => {
			if (!name) {
				resolve({});
			}
			if (name.indexOf('-') !== -1) {
				name = name.toString().split('-')[0];
			} else if (name.indexOf(':') !== -1) {
				name = name.toString().split(':')[0];
			}
			name = name.replace('/', '');
			Lionel.call('__getRenderedTemplate', name, (error, result) => {
				if (error) {
					reject(new Error(error));
				} else {
					resolve(result);
				}
			});
		});
	},
	/**
     * Load pages/templates to Lionel
     *
     * 1. Get the template data from server {html:'HTML Code of page', onRendered:'JS code of page'}
     * 2. Put HTML into <div class="LionelPageContent"></div> with Lionel._renderPage
     * 3. Checks that there is a <script> for this template or not.
     *      -Yes: just call function from that window._onRendered_(nameofTemplate)()
     *      -No:  Put into a <script> and append to body, after that will call!
     *
     * @param {String} name
     * @param {string|undefined} parent
     */
	getPage: function (name, parent) {
		this.clearAllIntervals();
		const globals = Object.keys(this.globals);
		const self = this;
		globals.forEach(property => {
			if (typeof self.globals[property].remove === 'function') {
				self.globals[property].remove();
			} else if (typeof this.globals[property].destroy === 'function') {
				self.globals[property].destroy();
			}
			delete self.globals[property];
		});
		if (parent === undefined) parent = '.LionelPageContent';
		if (name.indexOf('-') !== -1) {
			name = name.toString().split('-')[0];
		} else if (name.indexOf(':') !== -1) {
			name = name.toString().split(':')[0];
		}
		name = name.replace('/', '');
		Lionel.call('__getRenderedTemplate', name, function (error, result) {
			if (!error) {
				self._renderPage(name, parent, result);
			} else {
				if (result && result.details) {
					result = { html: 'Error: ' + result.details.message + '<br> URL: ' + result.details.url + '<br>Please refresh the page if it doesnt happen automatically.' };
					self._renderPage(name, parent, result);
					setTimeout(function () {
						location.reload();
					}, 5000);
				} else if (result && result.message) {
					result = { html: 'Error: ' + result.message + '<br> URL: ' + result.url + '<br>Please refresh the page if it doesnt happen automatically.' };
					self._renderPage(name, parent, result);
					setTimeout(function () {
						location.reload();
					}, 5000);
					// }else {
				}
			}
		}).catch(function (e) {
			if (e.url === '__getRenderedTemplate') {
				console.error('Session has no longer active or the server is down');
			}
		});
	},
	/**
     * 2. Put HTML into <div class="LionelPageContent"></div> with Lionel._renderPage
     * 3. Checks that there is a <script> for this template or not.
     *      -Yes: just call function from that global._onRendered_(nameofTemplate)()
     *      -No:  Put into a <script> and append to body, after that will call!
     *
     * Handles some error from the server, but not too much
     * @param {String} name      - Name of template
     * @param {String} parent    - This usually .LionelPageContent
     * @param {Object} result    - {html:'HTML Code of page', onRendered:'JS code of page'}
     * @private
     */
	_renderPage: function (name, parent, result) {
		if (document.querySelector('#__render_' + name) !== null) {
			document.querySelector('#__render_' + name).outerHTML = '';
		}
		if (result !== undefined && result !== false && typeof result === 'object') {
			const parentElement = document.querySelector(parent);
			if (parentElement === null) {
				document.body.innerHTML = '<h1>Bad Config on Client Side</h1>Browser will be refreshed in 3 seconds.';
				setTimeout(function () {
					location.reload();
				}, 3000);
				return;
			}
			parentElement.innerHTML = result.html;
			if (document.querySelector('#rendered' + name) !== null && window['_onRendered_' + name] !== undefined) {
				Lionel._pageOnRendered(name);
				Lionel._scriptOnRendered('', '_onRendered_' + name);
			} else if (result.onRendered) {
				const script = document.createElement('script');
				script.type = 'text/javascript';
				script.id = 'rendered' + name;
				// if(global.devMode === true){
				//    script.src = 'console/'+name;
				// }else{
				script.innerHTML = 'window._onRendered_' + name + '=function(c){window.LionelError = "";Lionel._pageOnRendered();try{\n' + result.onRendered + '\n}catch(e){LionelError = e;}if(typeof c === "function"){c(LionelError)};};Lionel._scriptOnRendered(window.LionelError,"_onRendered_' + name + '");';
				// }
				// script.src = 'rendered/'+result.onRendered+'.js';
				document.querySelector('body').appendChild(script);
				// document.head.appendChild(script);
			}
		} else if (typeof result === 'string') {
			document.querySelector(parent).innerHTML = '<h1>Your session has expired</h1>The current page will be refreshed in 3 seconds.';
			setTimeout(function () {
				location.reload();
			}, 3000);
		}
	},
	_pageOnRendered: function () {
		this._runScriptsOnPage();
	},
	_scriptOnRendered: function (error, onRendered) {
		if (error) {
			console.warn('OnRendered unsuccessful: ' + error);
		}
		window[onRendered](function (error) {
			if (error) {
				console.error(error);
			}
		});
	},
	/**
	 * This is an inner navigation call. You can navigate to an another page without refreshing the browser.
	 * No need to download some external files and globals, so it saves network traffic
     * @param href
     */
	navigate: function (href) {
		if (href.charAt(0) === '/') {
			href = href.substring(1);
		}

		window.history.pushState({}, href, href); // TODO - navigating to links including colon (:) causes NS_ERROR_FAILURE

		href = href.replace('#', '');
		if (href === '') {
			Lionel.getPage('index');
		} else {
			Lionel.getPage(href.toString());
		}
	},
	/**
	 * Refresh scripts on a specific page
	 * @param parent
	 * @private
	 */
	_runScriptsOnPage: function (parent) {
		if (!parent) parent = '.LionelPageContent';
		document.querySelectorAll('body ' + parent + ' script').forEach(function (d) {
			const p = document.querySelector(parent);
			const src = d.getAttribute('src');
			const script = document.createElement('script');
			script.type = 'text/javascript';
			if (src !== null) {
				script.src = src;
			} else {
				script.innerHTML = d.innerHTML;
			}
			p.appendChild(script);
			d.outerHTML = '';
		});
	},
	intervalStorage: [],
	globals: {},
	clearAllIntervals: function () {
		const self = this;
		self.intervalStorage.forEach(function (d) {
			if (d) {
				self.clearInterval(d);
			}
		});
		self.intervalStorage = [];
	},
	setInterval: function (f, t) {
		const i = setInterval(f, t);
		this.intervalStorage.push(i);
		return i;
	},
	clearInterval: function (f) {
		let i = null;
		if (this.intervalStorage) {
			this.intervalStorage.forEach(function (d, j) {
				if (d && d === f) {
					i = j;
				}
			});
		}
		if (i !== null) {
			delete this.intervalStorage[i];
		}
		return clearInterval(f);
	},
	/**
     * @param {String} cookieName
     * @param {String} cookieValue
     */
	setCookie: function (cookieName, cookieValue) {
		const exdays = 1;
		const d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		const expires = 'expires=' + d.toUTCString();
		document.cookie = cookieName + '=' + cookieValue + ';' + expires + ';path=/';
	},
	/**
     * @param {String} cookieName
     * @returns {string}
     */
	getCookie: function (cookieName) {
		const name = cookieName + '=';
		const decodedCookie = decodeURIComponent(document.cookie);
		const ca = decodedCookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return '';
	}
};
module.exports = {
	Lionel
};

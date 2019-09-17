'use strict';
/**
 * Input Form
 * @typedef {Object} InputForm
 * @property {string} name - Name attribute
 * @property {string} type - Type attribute,
 * can be: button,checkbox,color,date,datetime-local,email,file,hidden,image,month,number,password,
 * radio,range,reset,search,submit,tel,text,time,url,week
 * @property {string} value - Value of the input
 * @property {string} placeholder
 * @property {boolean} checked
 * @property {string} innerHTML
 * @property {string} id - Important for the label
 * @property {string} label - Description/title for input
 */

/**
 * Lionel Client Object
 */
const LionelClient = {
	/**
	 * @param args
	 * @returns {*|Promise<any>}
	 */
	call: function (...args) {
		let i = 1;
		const isThereCallback =  typeof args[args.length - 1] === 'function';
		const lastArgument = isThereCallback ? args.length - 1 : args.length;
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
			url: '/call.php',
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
		const call = typeof options.url === 'string' ? options.url : '/call.php';
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
				LionelClient.call('__getPublicJS', name, function (error, result) {
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
	Helper: {
		node: null,

		/**
		 * @param {string|string[]} className
		 * @returns {Helper}
		 */
		addClass(className){
			const self = this;
			if (className && self.node instanceof HTMLElement) {
				if (typeof className === 'string') {
					className.split(' ').forEach(className => {
						if( className ) {
							self.node.classList.add(className);
						}
					})
				} else if(Array.isArray(className)){
					className.forEach(string => {
						if(typeof string === 'string' && string){
							self.node.classList.add(string);
						}
					})
				}
			}
			return this;
		},

		/**
		 * @param {Object} styles
		 * @returns {Helper}
		 */
		setStyles(styles) {
			if (styles && typeof styles === 'object' && self.node instanceof HTMLElement) {
				const keys = Object.keys(styles);

				keys.forEach(key => {
					if( key && typeof key === 'string') {

						const parts = key.split('-');

						if (parts.length === 1) {
							self.node.style[key] = styles[key];
						} else {
							let formattedStyleName = '';
							parts.forEach((part,index) => {
								if (part){
									if (index) {
										formattedStyleName += part.charAt(0) + part.substring(1);
									} else {
										formattedStyleName += part;
									}
								}

							})
						}
					}
				});
			}
			return this;
		},

		append(...nodes) {
			if (this.node instanceof HTMLElement) {

				for (let i = 0; i < nodes.length; i++) {

					if(nodes[i] instanceof HTMLElement){
						this.node.appendChild(nodes[i]);
					} else if (typeof nodes[i] === 'object' && nodes[i].node instanceof HTMLElement){
						this.node.appendChild(nodes[i].node);
					}
				}
			}
			return this;
		},

		/**
		 * @param {Object} attributes
		 * @returns {Helper}
		 */
		setAttributes(attributes) {
			if (this.node instanceof HTMLElement && attributes && typeof attributes === 'object') {
				const keys = Object.keys(attributes);
				const self = this;

				keys.forEach(key => {
					self.node.setAttribute(key,attributes[key]);
				});
			}
			return this;
		},

		/**
		 * @param {string} eventName
		 * @param {function} method
		 * @returns {Helper}
		 */
		on(eventName, method) {
			if (this.node instanceof HTMLElement && eventName
				&& typeof eventName === 'string' && typeof method === 'function') {
				this.node['on'+eventName] = method;
			}
			return this;
		},

		/**
		 * @param {string} name
		 * @param {string} data
		 * @returns {Helper}
		 */
		setData(name,data) {
			if (this.node instanceof HTMLElement && name && typeof name === 'string' && data ) {
				this.node.setAttribute('data-'+name,data);
			}
			return this;
		},

		/**
		 * @param {string} name
		 * @returns {Helper}
		 */
		removeData(name) {
			if (this.node instanceof HTMLElement && name && typeof name === 'string' ) {
				this.node.removeAttribute('data-'+name);
			}
			return this;
		},

		/**
		 * @param {string} name
		 * @returns {string|null}
		 */
		getData(name) {
			if (this.node instanceof HTMLElement && name && typeof name === 'string') {
				return this.node.getAttribute(name);
			}
			return null;
		},

		getAllData() {
			const attributes = this.attributes;
			const length = attributes.length;
			const result = [];
			for (let i = 0; i < length; i++) {
				result.push({
					name:attributes[i].name,
					value: attributes[i].value
				});
			}
			return result;
		},

		/**
		 * @param {string} type
		 * @param {Object} details
		 * @param details.className
		 * @param details.classList
		 * @param details.styles
		 * @param details.innerHTML
		 * @param details.innerText
		 * @param details.innerElement
		 * @param details.innerElements
		 * @param details.id
		 * @param details.checked
		 * @returns {Helper}
		 */
		createElement(type,details) {
			if ( !type ) {
				type = 'div'
			}
			if ( !details ) {
				details = {};
			}
			if (typeof type !== 'string' || typeof details !== 'object') {
				throw 'Error: Invalid type';
			}
			this.node = document.createElement(type);
			const self = this;

			if (details.className) {
				this.addClass(details.className);
			}
			if (details.classList) {
				this.addClass(details.classList)
			}
			if (details.styles) {
				this.setStyles(details);
			}
			if (details.innerHTML) {
				this.node.innerHTML = details.innerHTML;
			}
			if (details.innerText) {
				this.node.innerHTML = details.innerText;
			}
			if (details.innerElement instanceof HTMLElement) {
				this.node.appendChild(details.innerElement)
			}
			if (Array.isArray(details.innerElements)) {
				details.innerElements.forEach(element => {
					if (element instanceof HTMLElement) {
						self.node.appendChild(element);
					}
				});
			}
			if (details.id) {
				this.node.id = details.id;
			}
			if (details.checked) {
				this.node.id = details.checked;
			}
			return this;
		},

		/**
		 * @param {Array[]} lineArray
		 * @param {Object} details
		 * @param details.className
		 * @param details.classList
		 * @param details.styles
		 * @param details.header
		 * @param details.footer
		 * @param details.events
		 * @returns {Helper}
		 */
		createTable(lineArray,details) {
			if (!lineArray) {
				lineArray = [];
			}

			if ( !details ) {
				details = {};
			}
			if(!Array.isArray(lineArray) || typeof details !== 'object') {
				throw 'Error: Invalid type';
			}

			this.node = document.createElement('table');

			if (details.className) {
				this.addClass(details.className);
			}
			if (details.classList) {
				this.addClass(details.classList)
			}
			if (details.styles) {
				this.setStyles(details);
			}

			const getTableLine = function (columns, type = 'td') {
				const tr = document.createElement('tr');

				if (Array.isArray(columns)) {
					columns.forEach(column => {
						const tableElement = document.createElement(type);
						if (typeof column === 'string' || typeof column === 'number'){
							tableElement.innerHTML = column
						} else if (typeof column === 'function') {
							const functionResult = column();

							if (functionResult instanceof HTMLElement) {
								tableElement.appendChild(functionResult)
							} else if (functionResult) {
								tableElement.innerHTML = functionResult;
							}
						} else if (column instanceof HTMLElement) {
							tableElement.appendChild(column);
						} else if (column && typeof column === 'object') {
							try {
								tableElement.innerHTML = JSON.stringify(column);
							} catch ( e ) {
								console.warn(e);
							}
						} else {
							console.warn('Invalid column data')
						}

						tr.appendChild(tableElement);
					});
				}

				if (details.events && typeof details.events === 'object') {
					const names = Object.keys(details.events);
					names.forEach(event => {
						if (typeof details.events[event] === 'function') {
							tr[event] = function (ev) {
								if (typeof ev.preventDefault === 'function') {
									ev.preventDefault();
								}
								details.events[event](columns,ev);
							}
						}
					})
				}

				return tr;
			};

			const thead = document.createElement('thead');
			if (Array.isArray(details.header)) {
				thead.appendChild(getTableLine(details.header,'th'));
			}
			this.node.appendChild(thead);
			const tbody = document.createElement('tbody');
			lineArray.forEach(line => {
				tbody.appendChild(getTableLine(line));
			});
			this.node.appendChild(tbody);

			if (Array.isArray(details.footer)) {
				const tfoot = document.createElement('tfoot');
				tfoot.appendChild(getTableLine(details.footer));
				this.node.appendChild(tfoot);
			}
			return this;
		},

		/**
		 * @param {Array} options
		 * @param {Object} details
		 * @param details.className
		 * @param details.classList
		 * @param details.styles
		 * @param details.label
		 * @param details.id
		 * @returns {Helper}
		 */
		createSelector(options,details) {
			if (!options) {
				options = [];
			}

			if ( !details ) {
				details = {};
			}
			if(!Array.isArray(options) || typeof details !== 'object') {
				throw 'Error: Invalid type';
			}

			this.node = document.createElement('select');
			const self = this;
			if (details.className) {
				this.addClass(details.className);
			}
			if (details.classList) {
				this.addClass(details.classList)
			}
			if (details.styles) {
				this.setStyles(details);
			}
			if (details.label) {
				this.node.label = details.label;
			}
			if (details.id) {
				this.node.label = details.id;
			}

			options.forEach(option => {
				if (option) {
					const node = document.createElement('option');

					if (typeof option === 'string') {
						node.setAttribute('value',option);
						node.innerHTML = option
					} else if (typeof option === 'object') {
						node.innerHTML = option.name || option.innerHTML || '';
						node.setAttribute('value',option.value || '');
					}
					self.node.appendChild(node);
				}
			});
			return this;
		},

		/**
		 * @param {string|HTMLElement} selector
		 * @returns {Helper}
		 */
		select(selector) {
			if (selector) {
				const self = this;

				if ( typeof selector === 'string' ) {
					self.node = document.querySelector(selector);
				} else if ( selector instanceof HTMLElement ) {
					self.node = selector;
				}
			}
			return this;
		},

		/**
		 *
		 * @param {InputForm[]} inputs
		 * @param {Object} details
		 * @param details.title
		 * @param details.action
		 * @param details.method
		 * @param details.target
		 * @param details.className
		 * @param details.classList
		 * @param details.styles
		 * @returns {Helper}
		 */
		createForm(inputs,details) {
			if (!inputs) {
				inputs = [];
			}

			if ( !details ) {
				details = {};
			}
			if(!inputs || typeof details !== 'object') {
				throw 'Error: Invalid type';
			}

			this.node = document.createElement('form');
			const self = this;

			if (details.className) {
				this.addClass(details.className);
			}
			if (details.classList) {
				this.addClass(details.classList)
			}
			if (details.styles) {
				this.setStyles(details);
			}

			const createInput = input => {
				if (input) {
					if (input instanceof HTMLElement) {
						if (input.label) {
							const label = document.createElement('label');
							if (input.id) {
								label.setAttribute('for',input.id);
							}
							label.innerHTML = input.label;
							self.node.appendChild(label);
						}
						self.node.appendChild(input);
					} else if (typeof input === 'object') {

						const node = document.createElement('input');
						node.setAttribute('type',input.type || 'text');
						if (input.value) {
							node.setAttribute('value',input.value);
						}
						if (typeof input.checked === 'boolean') {
							node.setAttribute('value',input.checked);
						}
						if (input.placeholder) {
							node.setAttribute('value',input.placeholder);
						}
						if (input.name) {
							node.setAttribute('value',input.name);
						}
						if (input.innerHTML) {
							node.innerHTML = input.innerHTML;
						}
						if (input.className) {
							node.className = input.className;
						}
						if (input.id) {
							node.id = input.id;
						}
						if (input.label) {
							const label = document.createElement('label');
							if (input.id) {
								label.setAttribute('for',input.id);
							}
							label.innerHTML = input.label;
							self.node.appendChild(label);
						}
						self.node.appendChild(node);
					}
				}
			};

			if (details.title) {
				const title = document.createElement('h3');
				title.classList.add('title');
				title.innerHTML = details.title;
				this.node.appendChild(title);
			}
			if (Array.isArray(inputs)) {
				inputs.forEach(createInput);
			} else if(typeof inputs === 'object'){
				const inputList = Object.keys(inputs);
				inputList.forEach(id => {
					inputs[id].id = id;
					createInput(inputs[id]);
				})
			} else {
				console.warn('Invalid input');
			}

			if (details.action) {
				this.node.setAttribute('action',details.action);
			}
			if (details.method) {
				this.node.setAttribute('method',details.method);
			}
			if (details.target) {
				this.node.setAttribute('target',details.target);
			}

			return this;
		}
	},
	callList: {},
	/**
	 * You can use this function if you want to get HTML and JS data from a specific URL/file
	 * @param {String} name
	 * @returns {Promise<any>}
	 */
	getPageContent: function (name) {
		return new Promise((resolve, reject) => {
			reject(new Error('PHP version of Lionel-App doesnt support this operation: getPageContent'));
		});
	},
	/**
	 * Load pages/templates to Lionel
	 * @param {String} name
	 */
	getPage: function (name) {
		if (!name.endsWith('.php') && !name.endsWith('.html')  && name !== '/') {
			window.location.href = "/" + name + '.html';
		} else {
			window.location.href = "/"+ name;
		}
	},
	/**
	 * 2. Put HTML into < div class='LionelPageContent' ></div> with LionelClient._renderPage
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
				LionelClient._pageOnRendered(name);
				LionelClient._scriptOnRendered('', '_onRendered_' + name);
			} else if (result.onRendered) {
				const script = document.createElement('script');
				script.type = 'text/javascript';
				script.id = 'rendered' + name;
				// if(global.devMode === true){
				//    script.src = 'console/'+name;
				// }else{
				script.innerHTML = 'window._onRendered_' + name + '=function(c){window.LionelError = "";LionelClient._pageOnRendered();try{\n' + result.onRendered + '\n}catch(e){LionelError = e;}if(typeof c === "function"){c(LionelError)};};LionelClient._scriptOnRendered(window.LionelError,"_onRendered_' + name + '");';
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
		if (!href.endsWith('.php') && !href.endsWith('.html') && href !== '/') {
			window.location.href = href+'.html';
		} else {
			window.location.href = href;
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
if (!window._modules) { window._modules = {}; }
module.exports = { LionelClient };

'use strict';
/**
 * Lionel-App: Template Manager
 * Copyright (C) 2016 Attila Reterics
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @package    ReadAty/lionel-app
 * @author     Attila Reterics
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL
 * @copyright  (C) 2016 Attila Reterics, reterics.attila@gmail.com
 *
 */

const fs = require('fs');
const FM = require('./fileManager.js').FM;
const path = require('path');
const { commonJSBundler } = require('lionel-commonjs-bundler');

/**
 * @type TemplateManager
 */
class TemplateManagerBaseCore {
	constructor (options) {
		const time = new Date().getTime(); // for benchmark
		if (!options) options = {};
		this._templates = {};
		this.globalJS = null;
		this._templateEngineRegExp = {
			init: null,
			start: new RegExp('<template\\s+name=[\'"][\\w_]+[\'"]>'),
			check: '<template',
			name: new RegExp('[\'"][\\w_]+[\'"]'),
			end: '</template>',
		};
		this._importedData = {};
		this._debugMode = typeof options.debug !== 'undefined' ? options.debug : false;
		this._lastUpdated = 0;
		this.htmlFormat = '.html';

		if (options.lib) {
			this.addLibFolder(options.lib);
		}
		if (options.global) {
			this.setGlobalJS(options.global);
		} else {
			this.setGlobalJS(path.resolve(__dirname,'../app/globals.js'));
		}
		this.loadGlobalJS();
		if (options.view) {
			this.loadTemplates(options.view);
		}
		if (options.js) {
			const loadedControllers = this.loadControllers(options.js);
			if (this._debugMode) {
				console.log('Loaded ' + loadedControllers + ' Template OnRendered Data to Loader in ' + Math.floor(new Date().getTime() - time) + ' ms');
			}
		}
	}

	addTemplate (name, html, type) {
		if (typeof name !== 'undefined') {
			if (this._templates[name]) {
				if (type !== 'html') {
					this._templates[name][type] += html;
				} else if (name !== null && name !== '') {
					console.error('Template already exists: ' + name);
				}
			} else {
				this._templates[name] = { html: '', onRendered: '' };
				this._templates[name][type] = html;
			}
		}
	}

	/**
     * @param {*} response
     * @param {Object} render
     */
	static sendRenderData (response, render = {}) {
		if (typeof render.send === 'function') {
			render.send(response);
		}
		return response;
	}

	/**
     * This function renders the template {html:'HTML Code of page', onRendered:'JS code of page'}
     *
     * @type renderTemplate
     */
	renderTemplate (name, parameters, res) {
		const self = this;
		let html = '';
		let render;
		if (!parameters) parameters = {};
		this._renderedList = [name];

		if (typeof res === 'object' && typeof res.send === 'function') {
			render = res;
		}
		if (html === '' && this._templates[name]) {
			html = this._replace.call(this, this._templates[name].html);
		}

		let script;

		/**
         * This function checks whether this is a parent HTML (with head and body) of just a content/template
         * If this is a parent, the script put all global variables, and base Logic (Lionel object)
         * to a <script></script> and add to the code
         */
		if (html.indexOf('</head>') !== -1) {
			script = 'function onLoadData(){';
			this._renderedList.forEach(function (name) {
				script += self._templates[name].onRendered + '\n';
			});
			if (self._debugMode === true) console.log('Render HTML Template');
			/**
             *  Head will contains 2 <script></script>
             *
             *  First contains libaries and global objects like Lionel for Lionel.calls
             *
             *  Second contains the client/controllers/_html.js what will run the first time,
             *  but the .html.js will in a function, named onLoadData, and this called by the onload event of <Body>
             *
             *  function onLoadData(){
             *      conntent on _html.js
             *  }
             *
             *  Any other HTML/JS template later for example if we navigate to Technology,Admin,Reports...etc will be loaded
             *  by LionelClient.getPage() code
             */
			const load = parameters.template ? 'LionelClient.getPage("' + parameters.template + '")' : '';

			const globalJS = name.indexOf('_') !== -1 ? '<script type="text/javascript">' + self._templates.__globals.onRendered + '</script>' : '';
			script = globalJS + '<script type="text/javascript">' + script + load + '}</script></head>';
			html = html.replace('</head>', script);
			const positionBody = html.indexOf('<body');
			const positionBodyEnd = html.indexOf('</body>');

			if (positionBody !== -1 && positionBodyEnd !== -1) {
				const start = html.slice(0, positionBody);
				const end = html.slice(positionBodyEnd + 7);
				html = start + '<body onload="onLoadData()"><div class="LionelPageContent"></div></body>' + end;
			}

			return TemplateManagerBaseCore.sendRenderData(html, render);
		} else {
			/**
             * This section just render the html and onRendered without any modification
             * @type {{html: string, onRendered: string}}
             */
			const response = { html: '', onRendered: '' };
			response.html = html;
			self._renderedList.forEach(function (name) {
				response.onRendered += self._templates[name] ? self._templates[name].onRendered + '\n' : '';
			});
			return TemplateManagerBaseCore.sendRenderData(response, render);
		}
	}

	/**
     * This function renders templates recursively, so make more files to one using Handlebars
     *  For example reads {{>readedFile}} from readedFile.html and put the content of it
     * @param {String} html
     * @returns {string}
     * @private
     */
	_replace (html) {
		if (typeof html !== 'string') {
			console.warn('No HTML found in one template');
			return '';
		}
		const self = this;
		return html.replace(/{{\s*[\w.>#/_]+\s*}}/g, function (d) {
			const html = self._getTemplateCode.call(self, d);
			if (html !== null) {
				return self._replace.call(self, html);
			}
			return d;
		});
	}

	_addJSToRenderList (name) {
		if (!name) return;
		let was = false;
		this._renderedList.forEach(function (n) {
			if (n === name) was = true;
		});
		if (!was) this._renderedList.push(name);
	}

	_getTemplateCode (data) {
		let name = data.substring(2, data.length - 2);
		if (name.charAt(0) === '>') {
			name = name.substring(1, name.length);
			if (this._templates[name]) {
				this._addJSToRenderList.call(this, name);
				return this._templates[name].html;
			} else {
				return '';
			}
		}
		return '';
	}

	/**
     * This function tries to detect "templates" in .html files <template name="something"> HTML Code here  </template>
     *
     * Template is completely same like .html, but it is not in different files. We used this 2 years.
     * See: client/views/templates.html
     * @param {String} html
     * @returns {number}
     * @private
     */
	_checkForTemplates (html) {
		const self = this;
		let added = 0;
		const regexps = self._templateEngineRegExp;
		if (typeof regexps.init === 'function') {
			html = regexps.init(html, this);
		}
		const templatesRaw = html.toString().split(regexps.end.toString());
		if (templatesRaw.length < 2) {
			if (templatesRaw.length === 1) {
				if (templatesRaw[0].indexOf(regexps.check) === -1) {
					return added;
				}
			} else {
				return added;
			}
		}
		// let data = '';
		templatesRaw.forEach(templateRaw => {
			let name = '';
			let template = '';

			templateRaw.replace(regexps.start, function (d) {
				template = templateRaw.split(d)[1];
				d.replace(regexps.name, function (n) {
					name = n.substring(1, n.length - 1);

					return '';
				});
				return '';
			});
			// data += templateRaw.split(regexps.check)[0];
			// data += templateRaw.split(regexps.end)[1] ? templateRaw.split(regexps.end)[1] : '';
			self.addTemplate(name, template, 'html');

			added++;
		});
		return added;
	}

	/**
     * Here we load .html templates from views folder.
     * We can change this of course for HTML if it is more comfortable
     * @param dir
     */
	loadTemplates (dir) {
		if (!fs.existsSync(dir)) {
			console.warn('Template folder doesnt exists.');
			return;
		}
		// Reading templates Beta
		const divider = FM.separator;
		let added = 0;
		const files = FM.fileListRecursive(dir, { type: 'long' }).filter(f => f.includes(this.htmlFormat));
		for (let i = 0; i < files.length; i++) {
			const file = files[i].toString();
			const pos = file.lastIndexOf(divider);
			const name = file.substring(pos + 1).replace(this.htmlFormat, '');
			const html = fs.readFileSync(file).toString();
			const a = this._checkForTemplates.call(this, html);
			if (a === 0) {
				added++;
				this.addTemplate.call(this, name, html, 'html');
			} else {
				added += a;
			}
		}
		if (this._debugMode === true) console.log('Loaded ' + added + ' Template to Loader');
	}

	/**
     * We set that Javascript file what contains every global variable:
     * Global variables and javascript codes are always loaded to the webPage
     * @param path
     */
	setGlobalJS (path) {
		if (FM.fileExists(path)) {
			this.globalJS = path;
		}
	}

	/**
     * Load Global variables, what we initially send to the Application (LionelAPI.js)
     */
	loadGlobalJS () {
		this.globalStorage = []; // Global Variable Loaded Cache

		const globalJavascript = this.globalJS ? fs.readFileSync(this.globalJS).toString() : '';

		const loader = 'if ( typeof window.require !== "function" ) { window.require = function(path){return window._modules[path] || {}}; }' +
			'if ( !window._modules ) { window._modules = {}; }';

		if (typeof this.globalJS === 'string') {
			const modulePath = path.resolve(this.globalJS).replace('globals.js','globals');
			const loadToGlobal = 'const { LionelClient } = window.require("'+modulePath+'");';

			this.globalStorage.push(modulePath);
			this.globalStorage.push(modulePath+'.js');
			const assignToJS  = 'window._modules["'+modulePath+'.js"] = window._modules["'+modulePath+'"]';
			this._templates.__globals = {
				onRendered: loader + commonJSBundler.packInBundle(modulePath,globalJavascript) +  loadToGlobal + assignToJS
			};
		} else {
			this._templates.__globals = { onRendered:  '' };
		}

	}

	/**
     *  Imports folders mean a folder when we store JS files only for Require purposes
     * @param {String} folderPath
     */
	addLibFolder (folderPath) {
		if (!fs.existsSync(folderPath)) {
			console.warn('Lib folder doesnt exists.');
			return;
		}
		const options = { type: 'detailed' };
		if (this._importedData) {
			this._importedData = Object.assign(this._importedData,
				FM.fileListRecursive(folderPath, options),
			);
		} else {
			this._importedData = Object.assign({},
				FM.fileListRecursive(folderPath, options),
			);
		}
	}

	/**
     *  Controllers are the main onLoad javascript files for the webpages
     * @param {String} controllerDir
     * @returns {Number}
     */
	loadControllers (controllerDir) {
		if (!fs.existsSync(controllerDir)) {
			console.warn('Controller folder doesnt exists.');
			return 0;
		}
		const controllerFilesUnprocessed = FM.fileListRecursive(controllerDir, { type: 'long' }).filter(f => f.includes('.js')).sort(function (a) {
			if (a === '__html') {
				return -1;
			} else {
				return 1
			}
		});

		const self = this;
		for (let i = 0; i < controllerFilesUnprocessed.length; i++) {
			const file = controllerFilesUnprocessed[i].toString();
			const pos = file.lastIndexOf(FM.separator);
			const name = file.substring(pos + 1).replace('.js', '');
			if (!this._templates[name]) {
				this._templates[name] = { onRendered: '', html: '' };
			}

			const html = fs.readFileSync(file).toString();

			const isGlobal = name === '__html';

			let cacheFormat = {};
			if (Array.isArray(this.globalStorage) && this.globalStorage.length){
				this.globalStorage.forEach(function (line) {
					cacheFormat[line] = '_';
				})
			}

			const options = {
				loadedFiles: [],
				loadedCache: cacheFormat
			};

			this._templates[name].onRendered = commonJSBundler.makeCode(html, controllerDir, options);

			if (isGlobal && Array.isArray(options.loadedFiles) && options.loadedFiles.length) {
				options.loadedFiles.forEach(function (file) {
					self.globalStorage.push(file);
				})
			}
		}
		this._lastUpdated = new Date().getTime();
		return controllerFilesUnprocessed.length;
	}

	loadOneClientFile (address) {
		// this._lastUpdated = new Date().getTime();
		const file = address.toString();
		const pos = file.lastIndexOf(FM.separator);
		const name = file.substring(pos + 1).replace('.js', '');
		if (!this._templates[name]) {
			this._templates[name] = { onRendered: '', html: '' };
		}

		const html = fs.readFileSync(file).toString();

		const isGlobal = name === '__html';

		this._templates[name].onRendered = commonJSBundler.makeCode(html, address.substring(0,address.lastIndexOf('/') + 1), {
			loadedFiles: isGlobal ? this.globalStorage : {},
			loadedCache: isGlobal ? {} : this.globalStorage
		});

		// this._templates[name].onRendered = this._fileUnification.call(this, html, name === '__html');
		if (this._debugMode === true) console.log('Loaded ' + file + ' Template OnRendered Data to Loader');
	}
}

module.exports = { TemplateManagerBaseCore };

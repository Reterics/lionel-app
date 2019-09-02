'use strict';
const fs = require('fs');
const path = require('path');
const { mainDirectory, separator, appData, appName } = require('../constants');
const FM = {
	appName: appName,
	mainDirectory: mainDirectory, // this is top of server directory structure
	// buildDirectory:path.join(__dirname.split('bin')[0],'../build'),
	// assetsDirectory:__dirname.split('bin')[0].toString(), //Change this for assets or private folder
	separator: separator,
	appData: appData,
	uploadDir: this.appData,
	_validateAppData: function () {
		if (this.fileExists(this.appData)) {
			if (this.fileExists(this.appData + '/' + this.appName)) {
				console.log('Database Source validated');
				if (!this.fileExists(this.appData + '/' + this.appName + '/uploads')) {
					fs.mkdirSync(this.appData + '/' + this.appName + '/uploads');
				}
			} else {
				fs.mkdirSync(this.appData + '/' + this.appName);
				fs.mkdirSync(this.appData + '/' + this.appName + '/uploads');
			}
		}
	},
	/**
     * @param {String} dir
     */
	makeDir: function (dir) {
		return fs.mkdirSync(dir);
	},
	/**
     * @param {String} url
     * @returns {boolean}
     * @private
     */
	_exists: function (url) {
		let exists = false;
		try {
			exists = typeof fs.statSync(url) === 'object';
		} catch (e) {
			if (!e.message.toString().includes('/globals.js')) {
				console.warn(e.message);
			}
		}
		return exists;
	},
	fileExistsSync: function (file) {
		return fs.existsSync(file);
	},
	/**
     * @param {String} file
     * @returns {boolean}
     */
	fileExists: function (file) {
		return this._exists(file);
	},
	/**
     * @param {String} file
     * @returns {boolean}
     */
	isDirectory: function (file) {
		let exists = false;
		try {
			const f = fs.statSync(file);
			if (typeof f === 'object') {
				exists = f.isDirectory();
			}
		} catch (e) {
			console.warn(e.message);
		}
		return exists;
	},
	/**
     * @param {String} directory
     * @param {String} extension
     * @returns {string[]}
     */
	fileList: function (directory, extension) {
		let files = fs.readdirSync(directory);
		if (extension) files = files.filter(f => f.includes(extension));
		return files;
	},
	deleteAppData: function () {
		const folder = this.appData + this.separator + this.appName + this.separator;
		const fileList = this.fileList(folder, '.rs_');

		const self = this;
		if (Array.isArray(fileList)) {
			fileList.forEach(function (fileName) {
				if (fileName.includes(folder)) {
					self.deleteFile(fileName);
				} else {
					self.deleteFile(folder + fileName);
				}
			});
			return true;
		} else {
			return false;
		}
	},
	/**
     * @param {String} dir
     * @param {Object} options
     */
	fileStatsRecursive (dir, options) {
		if (!options) options = {};
		// detailed:{'uiHelpers.js' : ModifiedTimeUnixString}
		const pp = __dirname.indexOf('/') !== -1 ? '/' : '\\';

		const w = function (dr, ft, f) {
			const p = path;
			const fls = fs.readdirSync(dr);
			ft = ft || [];
			fls.forEach(function (fe) {
				const stat = fs.statSync(p.join(dr, fe));
				if (stat.isDirectory()) {
					ft = w(p.join(dr, fe), ft, f);
				} else if (fe.charAt(0) !== '.') {
					ft.push(fe);
					if (dr.charAt(dr.length - 1) !== pp) {
						f[dr + pp + fe] = stat.mtime.getTime();
					} else {
						f[dr + pp + fe] = stat.mtime.getTime();
					}
				}
			});
			return ft;
		};

		const list = [];
		const f = {};
		w(dir, list, f);
		return f;
	},
	/**
     * @param {String} dir
     * @param {Object|null} options
     */
	fileListRecursive (dir, options) {
		if (!options) options = {};
		if (!options.type) options.type = 'long';
		const p = __dirname.indexOf('/') !== -1 ? '/' : '\\';
		// short:   ['uiHelpers.js']
		// long:    ['/Users/user/project/ui/uiHelpers.js']
		// detailed:{'uiHelpers.js' : '/Users/user/project/ui/'}
		/**
         * @param {String} dr
         * @param {Array} ft
         * @param {Object} f
         * @returns {Array}
         */
		const w = function (dr, ft, f) {
			if (dr.indexOf('.git') !== -1 || dr.indexOf('.idea') !== -1) {
				return ft || [];
			}
			const p = path;
			const fls = fs.readdirSync(dr);
			ft = ft || [];
			fls.forEach(function (fe) {
				if (fs.statSync(p.join(dr, fe)).isDirectory()) {
					ft = w(p.join(dr, fe), ft, f);
				} else if (fe.charAt(0) !== '.') {
					ft.push(fe);
					f[fe] = dr;
				}
			});
			return ft;
		};

		const list = [];
		const f = {};
		w(dir, list, f);
		const output = [];
		switch (options.type) {
			case 'long':

				Object.keys(f).forEach(i => {
					if (f[i].charAt(f[i].length - 1) !== p) {
						output.push(f[i] + p + i);
					} else {
						output.push(f[i] + i);
					}
				});
				return output;
			case 'short':
				return list;
			case 'detailed':
				return f;
		}
		return f;
	},
	/**
     * @param {String} file
     * @returns {*}
     */
	readJSON: function (file) {
		let raw = null;
		try {
			raw = fs.readFileSync(file).toString();
			raw = JSON.parse(raw);
		} catch (e) {
			raw = null;
		}
		return raw;
	},
	/**
     * @param {String} file
     * @returns {string}
     */
	read: function (file) {
		let raw = '';
		try {
			raw = fs.readFileSync(file).toString();
		} catch (e) {
			console.error(e.message || e);
		}
		return raw;
	},
	/**
     * @param {String} file
     * @param {Object} json
     * @returns {boolean}
     */
	writeJSON: function (file, json) {
		let success = false;
		try {
			fs.writeFileSync(file, JSON.stringify(json));
			success = true;
		} catch (e) {
			console.error(e.message || e);
		}
		return success;
	},
	/**
     * @param {String} file
     * @param {String} data
     * @returns {boolean}
     */
	write: function (file, data) {
		let success = false;
		try {
			fs.writeFileSync(file, data);
			success = true;
		} catch (e) {
			console.error(e);
		}
		return success;
	},
	/**
     * @param {String} file
     * @param {Array} json
     * @returns {boolean}
     */
	writeBigJSONArray: function (file, json) {
		let error = false;
		let stream = null;
		try {
			stream = fs.createWriteStream(file, { flags: 'w' });
			stream.on('error', function (e) {
				console.error(e.message || e);
			});
		} catch (e) {
			error = true;
			console.error(e.message || e);
		}

		if (stream && Array.isArray(json) && !error) {
			stream.write('[');
			let buffer = '';
			// console.log('Save '+json.length+ ' data');
			json.forEach(function (d, i) {
				buffer += JSON.stringify(d) + '>end>,';
				if ((i + 1) % 500 === 0) {
					stream.write(buffer);
					buffer = '';
				}
			});
			if (buffer !== '') {
				// console.log('Empty buffer');
				stream.write(buffer);
			}
			stream.write(']');
		} else if (!error) {
			console.warn('Data is not array!');
			error = true;
		}
		if (stream && typeof stream.end === 'function') {
			stream.end();
		}

		return !error;
	},
	/**
     * @param {String} file
     * @param {Function} clb
     * @param {Object} options
     * @param {Number} options.skip
     * @param {Number} options.limit
     * @returns {Array}
     */
	readBigJSONArray: function (file, clb, options) {
		// console.log(file);
		const readStream = fs.createReadStream(file);
		const callback = clb || function () {

		};
		let stringBuffer = '';
		const JSONBuffer = [];

		// new Options
		if (!options) options = { skip: 0, limit: 10000 };
		if (!options.skip) options.skip = 0;
		if (!options.limit) options.limit = 10000;

		let skipCounter = 0;

		function onChunk (result) {
			stringBuffer += result;
			if (stringBuffer.indexOf('>end>,') !== -1) {
				const array = stringBuffer.split('>end>,');
				if (!makeJSONFromArray(array)) {
					if (array.length === 1) {
						stringBuffer = array[0];
					} else if (array.length === 0) {
						stringBuffer = '';
					}
				}
			}
		}

		function onEnd () {
			// Check remain data
			function checkBuffer () {
				if (stringBuffer.indexOf('>end>,') !== -1) {
					// There is a possible JSON, but if it JSON, the last char is ]
					let array = [];
					if (stringBuffer.indexOf('>end>,') !== -1) {
						array = stringBuffer.split('>end>,');
						const data = array.shift();
						JSONBuffer.push(JSON.parse(data));
					}
					if (array.length > 0) {
						if (array[0] !== '') {
							try {
								const js = JSON.parse(array[0] + '}');
								JSONBuffer.push(js);
							} catch (e) {
								// console.log('The last element may lost');
							}
						}
					}
					if (array.length > 1) {
						console.error('The JSON may be corrupted');
					}
					stringBuffer = '';
				}
			}

			checkBuffer();
			callback(false, JSONBuffer);
			// console.log('Remain data in buffer> '+ stringBuffer);
		}

		/**
         * @param {Array} array
         * @returns {boolean}
         */
		function makeJSONFromArray (array) {
			let error = false;
			if (array.length > 1) {
				const offense = array.shift();
				skipCounter++;
				try {
					// Check the indexing
					if (skipCounter > options.skip && JSONBuffer.length <= options.limit) {
						JSONBuffer.push(JSON.parse(offense));
					} else if (JSONBuffer.length > options.limit) {
						readStream.destroy('Limit reached');
					}
				} catch (e) {
					callback(true, undefined, 'Invalid or Corrupt File');
					error = true;
				}
				if (!error) {
					error = makeJSONFromArray(array);
				}
			}
			return error;
		}

		// When the stream is done being read, end the response
		readStream.on('close', () => {
			onEnd();
		});
		let first = false;
		readStream.on('data', chunk => {
			if (!first) {
				first = true;
				chunk = chunk.toString().substring(1);
			} else {
				chunk = chunk.toString();
			}
			onChunk(chunk);
		});
		return [];
	},
	/**
     * @param {String} file
     * @returns {boolean}
     */
	deleteFile: function (file) {
		let success = false;
		try {
			fs.unlinkSync(file);
			success = true;
		} catch (e) {
			console.warn(e.message);
		}
		return success;
	},
	/**
     * @param {String} file
     * @param {String} property
     * @param {String} value
     */
	changeProperty: function (file, property, value) {
		const object = this.readJSON(file);
		object[property] = value;
		this.writeJSON(file, object);
	},
	/**
     * @param {String} file
     * @param {String} property
     */
	getProperty: function (file, property) { // get one property or property list
		const object = this.readJSON(file);

		if (typeof property === 'object' && Array.isArray(property)) {
			const properties = {};
			property.forEach(function (p) {
				properties[p] = object[p];
			});
			return properties;
		}
		return object[property];
	},
	/**
     * @param {String} directory
     * @returns {boolean}
     */
	removeDir: function (directory) {
		let success = false;
		try {
			fs.rmdirSync(directory);
			success = true;
		} catch (e) {
			console.error(e.message);
		}
		return success;
	},
	/**
     * @param {String} source
     * @param {String} target
     * @returns {boolean}
     */
	copy: function (source, target) {
		const self = this;
		function copyFileSync (source, target) {
			let targetFile = target;
			if (self._exists(target)) {
				if (fs.lstatSync(target).isDirectory()) {
					targetFile = path.join(target, path.basename(source));
				}
			}

			try {
				fs.writeFileSync(targetFile, fs.readFileSync(source));
			} catch (e) {
				console.log(source);
				console.log(targetFile);
			}
		}
		/**
         * @param {String} source
         * @param {String} target
         */
		function copyFolderRecursiveSync (source, target) {
			let files = [];
			// check if folder needs to be created or integrated
			const targetFolder = path.join(target, path.basename(source));
			if (!self._exists(targetFolder)) {
				fs.mkdirSync(targetFolder);
			}
			if (fs.lstatSync(source).isDirectory()) {
				files = fs.readdirSync(source);
				files.forEach(function (file) {
					const curSource = path.join(source, file);
					if (fs.lstatSync(curSource).isDirectory()) {
						copyFolderRecursiveSync(curSource, targetFolder);
					} else {
						copyFileSync(curSource, targetFolder);
					}
				});
			}
		}

		if (self._exists(source)) {
			if (fs.lstatSync(source).isDirectory()) {
				copyFolderRecursiveSync(source, target);
			} else {
				copyFileSync(source, target);
			}
		} else {
			return false;
		}
		return true;
	}
};

module.exports = {
	FM
};

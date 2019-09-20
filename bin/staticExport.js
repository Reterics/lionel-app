const { Lionel } = require('./LionelClass');
const path = require('path');
const fs = require('fs');
const { FM } = require('./fileManager');

/**
 * Write a HTML file content to a file.
 * @param {string} route
 * @param {string} html
 * @param {string} folder
 */
const makeHTMLFile = function (route, html, folder) {
	const filePath = path.resolve(folder, route + '.html');

	try {
		fs.writeFileSync(filePath, html);
	} catch (e) {
		console.error(e.message);
	}
};
/**
 * Read the content of PHP file from ./bin/ folder
 * @param {string} fileName
 * @returns {string|*|string}
 */
const getPHPFile = function (fileName) {
	const file = './' + fileName;
	if (fs.existsSync(file)) {
		return FM.read(file);
	}
	const resolved = path.resolve(file);
	const resolvedWithDir = path.resolve(__dirname, file);

	if (fs.existsSync(resolvedWithDir)) {
		return FM.read(resolvedWithDir);
	} else if (fs.existsSync(resolved)) {
		return FM.read(resolved);
	} else {
		return '<?php  echo \'LionelClient operations are not supported by this server\'; ?>';
	}
};

const setPHPGlobals = function () {
	if (!Lionel.templateManager) {
		console.error('TemplateManager is not defined');
		return;
	}
	const file = '../app/phpGlobals.js';
	if (fs.existsSync(file)) {
		Lionel.templateManager.setGlobalJS(file);
		return Lionel.templateManager.loadGlobalJS();
	}
	const resolved = path.resolve(file);
	const resolvedWithDir = path.resolve(__dirname, file);

	if (fs.existsSync(resolvedWithDir)) {
		Lionel.templateManager.setGlobalJS(resolvedWithDir);
		return Lionel.templateManager.loadGlobalJS();
	} else if (fs.existsSync(resolved)) {
		Lionel.templateManager.setGlobalJS(resolved);
		return Lionel.templateManager.loadGlobalJS();
	} else {
		return 'globals for PHP version is not found. This may cause stability problems...\';';
	}
};

const exportToHTML = function (options) {
	const folder = options.phpExport;
	if (!folder || typeof folder !== 'string') {
		console.error('There is no valid folder name');
		return;
	}
	if (!fs.existsSync(folder)) {
		let error = false;
		try {
			fs.mkdirSync(folder);
		} catch (e) {
			console.error(e);
			error = true;
		}
		if (error) {
			return 1;
		}
	}
	setPHPGlobals();
	const TemplateManager = Lionel.templateManager;

	const Router = Lionel.Router;
	const routes = Object.keys(Router.routes);

	routes.forEach(function (route) {
		if (route) {
			const templateName = Router.checkRoute(route);

			const frame = TemplateManager.renderTemplate('__html', {}, undefined);

			const content = TemplateManager.renderTemplate(templateName, {}, undefined);

			const html = frame
				.replace('</body>', (content.onRendered ? '<script type="application/javascript">(function() {  ' + content.onRendered + '})()</script>' : '') + '</body>');

			makeHTMLFile(templateName, html.replace('<div class="LionelPageContent">', '<div class="LionelPageContent">' + (content.html ? content.html : '')), folder);
		}
	});

	const publicFolder = path.resolve(FM.mainDirectory, './app/public/');

	const fileList = FM.fileList(publicFolder, '');
	fileList.forEach(function (publicFile) {
		const publicPath = path.resolve(publicFolder, publicFile);
		FM.copy(publicPath, folder);
	});

	let phpConfig = '<?php ';
	if (options.db && Array.isArray(options.db)) {
		options.db.forEach(function (db) {
			if (db.type === 'mysql') {
				if (db.port !== 3306 && typeof db.port === 'number') {
					phpConfig += '$dbHost = "' + db.host + ':' + db.port + '";';
				} else {
					phpConfig += '$dbHost = "' + db.host + '";';
				}
				phpConfig += '$dbUser = "' + db.username + '";';
				phpConfig += '$dbPass = "' + db.password + '";';
				phpConfig += '$dbName = "' + db.database + '";';
			}
		});
	}
	phpConfig += ' ?> ';
	FM.write(path.resolve(folder, 'call.php'), phpConfig + getPHPFile('requestManager.php'));
	console.log('Your app exported to PHP to' + path.resolve(folder));
	process.exit(0);
};

module.exports = {
	exportToHTML
};

const { Lionel } = require('./LionelClass');
const path = require('path');
const fs = require("fs");
const { FM } = require('./fileManager');

const makeHTMLFile = function (route, html, folder) {
	const filePath = path.resolve(folder, route + '.html');

	try {
		fs.writeFileSync(filePath, html);
	} catch ( e ) {
		console.error(e.message);
	}
};


const exportToHTML = function (folder) {

	if (!fs.existsSync(folder)) {
		let error = false;
		try {
			fs.mkdirSync(folder);
		} catch ( e ) {
			console.error(e);
			error = true;
		}
		if (error) {
			return 1;
		}
	}
	const TemplateManager = Lionel.templateManager;

	const Router = Lionel.Router;
	const routes = Object.keys(Router.routes);


	routes.forEach(function (route) {
		if (route) {
			const templateName = Router.checkRoute(route);

			const frame = TemplateManager.renderTemplate('__html',{},undefined);

			const content = TemplateManager.renderTemplate(templateName,{},undefined);

			const html = frame
				.replace('</body>',(content.onRendered ? '<script type="application/javascript">(function() {  '+content.onRendered+'})()</script>' : '')+'</body>');

			makeHTMLFile(templateName,html.replace('<div class="LionelPageContent">','<div class="LionelPageContent">'+(content.html ? content.html : '')),folder);

		}

	});

	const publicFolder = path.resolve(FM.mainDirectory,'./app/public/');

	const fileList = FM.fileList(publicFolder,'');
	fileList.forEach(function (publicFile) {
		const publicPath = path.resolve(publicFolder,publicFile);
		FM.copy(publicPath,folder);
	})

};

module.exports = {
	exportToHTML
};

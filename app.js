'use strict';
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');

const { lionelMiddleware, serverStatic } = require('./bin/middleware');

const app = lionelMiddleware();
const { publicFolder, faviconImage } = require('./constants');
const { postCall, errorHandling } = require('./bin/requestManager');

const Lionel = require('./bin/LionelClass').Lionel;

app.use(serverStatic(publicFolder));
app.use(favicon(faviconImage));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(function (req, res) {
	if (req.method === 'GET' && req.url === '/call') {
		res.redirect('/');
	} else if (req.method === 'POST' && req.url === '/call') {
		postCall(req, res);
	} else if (!Lionel.Router.handleRequest(req.url, res)) {
		errorHandling(req, res);
	}
});

module.exports = { app };

'use strict';
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');

const { lionelMiddleware, serverStatic } = require('./bin/middleware');

const app = lionelMiddleware();
const { publicFolder, faviconImage } = require('./constants');

app.use(serverStatic(publicFolder));
app.use(favicon(faviconImage));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

module.exports = { app };

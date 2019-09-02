'use strict';
const Lionel = require('../bin/LionelClass').Lionel;

const Router = Lionel.Router;
Router.route('/index');
Router.route('/home', 'index');
Router.route('/', 'index');

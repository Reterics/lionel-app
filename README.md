# **Lionel-App**
[![TravisCI Status](https://api.travis-ci.org/RedAty/lionel-app.svg?branch=master)](https://travis-ci.org/RedAty/lionel-app)

Lionel is an open-source and minimalist environment to build your apps easily. You can make little webpages for your company, create presentations, or make just a little web server.

With Lionel you can create:

    * webpages with the latest ECMAScript standards
    * web applications
    * web services with databases

With Lionel Template Management you can:

    * separate your HTML and Javascript files to many places in Frontend too
    * reuse every element to save time and space
    * have a connection to server live data to the client
    * use your external libaries in multiple ways

Lionel backend give you:

    * A lightweight Router what can help to manage what you want to show in specific urls
    * Compatibility with standards: No need to learn too much because we use familiar technologies, like Middleware, Router
    * CPU + RAM friendly development: Because of the project doesn't have too much dependencies and it doesn't have big tasks in the background, you can develop in an older computer without any problems too
    * Responsiveness

## Install

Install from console
```
npm install lionel-app
```

First server (basic)

```javascript
const {initLionelServer} = require("lionel-app/bin/initLionelServer");
const {Lionel} = require("lionel-app/bin/LionelClass");
const Router = Lionel.Router;

const port = 8080;
initLionelServer(port,{
	appData: 'appData', //Folder in application data. (If needed)
	appName: 'Application', // Application name
	lib:'./app/lib/', //Folder for the CommonJS exports (Deprecated)
	view:'./app/views/', //Folder for the HTML files/templates
	js:'./app/js/', //Folder path for the onRendered Javascripts for the templates
	debug:true,
	liveUpdate:true, // Reload folders during the development
	mainDirectory:__dirname, //Current working directory
	separator:__dirname.indexOf('/') !== -1 ? '/' : '\\', //Path separator, (slash) If you want to add a custom
	requestListener:function(req,res) {
		//HTTP Server Request listener or middleware
	}
});


Router.route('/index');
Router.route('/', 'index');

```

First server (Middleware)

For middleware you can use Express JS and Lionel Middleware too. Usage is almost the same. Details in the documentation later

```javascript
const {initLionelServer} = require("lionel-app/bin/initLionelServer");
const {Lionel} = require("lionel-app/bin/LionelClass");
const Router = Lionel.Router;

const {app} = require("./app");


const port = 8080;
initLionelServer(port,{
	appData: 'appData', //Folder in application data. (If needed)
	appName: 'Application', // Application name
	lib:'./app/lib/', //Folder for the CommonJS exports (Deprecated)
	view:'./app/views/', //Folder for the HTML files/templates
	js:'./app/js/', //Folder path for the onRendered Javascripts for the templates
	debug:true,
	liveUpdate:true, // Reload folders during the development
	mainDirectory:__dirname, //Current working directory
	separator:__dirname.indexOf('/') !== -1 ? '/' : '\\', //Path separator, (slash) If you want to add a custom
	requestListener:app //Middleware
});


Router.route('/index');
Router.route('/', 'index');

```

First server with Databases (mongoDB and MySQL compatibility added)

In a Node JS application (later in PHP too), you can manage external databases like MySQL and MongoDB and access 
them from the client with LionelClient.mongodb() and LionelClient.mysql() in the client.

API is simple so anybody can start learning and create an application what using databases.

Later if the PHP support will be finished, Lionel-App can be used for Full Stack Development on almost every online 
Web Server what you can rent.

```javascript
const {initLionelServer} = require("lionel-app/bin/initLionelServer");
const {Lionel} = require("lionel-app/bin/LionelClass");
const Router = Lionel.Router;

const {app} = require("./app");


const port = 8080;
initLionelServer(port,{
	appData: 'appData', //Folder in application data. (If needed)
	appName: 'Application', // Application name
	view:'./app/views/', //Folder for the HTML files/templates
	js:'./app/js/', //Folder path for the onRendered Javascripts for the templates
	mainDirectory:__dirname, //Current working directory
	requestListener:app,
	db: [
    		{
    			type: 'mysql',
    			host: 'localhost',
    			database: 'angel',
    			port: 3306,
    			username: 'root',
    			password: ''
    		},
    		{
    			type: 'mongodb',
    			host: 'localhost',
    			database: 'collection',
    			username: '',
    			password: '',
    			port: 27017,
    		}
    	]
});


Router.route('/index');
Router.route('/', 'index');

```
## Future updates

Because of the Lionel App project is not done, it means i will send more updates in the future with


    * A Core development guide
    * LioDB: A mini database designed for big amount of documents
    * Node JS Multicore and server management: Helps to your server to use more CPU and break the limits of Node JS
    * Export webpage to Static HTML/PHP content for WebServers

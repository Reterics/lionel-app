const mysql = require('mysql');

/**
 * This is a MySQL class for running queries in the live database
 */
class MySQLClass {
	constructor () {
		this.loaded = false;
		this.lastError = null;
		this.config = {
			host: 'localhost',
			database: 'database',
			port: 3306,
			username: 'username',
			password: ''
		};
		this.connection = null;
	}

	/**
	 *
	 * @param {Object} config
	 * @param {string} config.host
	 * @param {string} config.name
	 * @param {number} config.port
	 */
	init (config) {
		this.config = config;
		try {
			this.connection = mysql.createConnection({
				host: this.config.host,
				user: this.config.username,
				password: this.config.password,
				database: this.config.database,
				port: this.config.port
			});

			// this.connection.connect();
			this.loaded = true;
			// this.connection.end();
		} catch (e) {
			console.error(e.message);
		}
	}

	_handleQuery (queryType, query) {
		const self = this;

		switch (queryType) {
			case 'type':
				return 'mysql';
			case 'query':
				return self.query.call(self, query);
			case 'list':
				return self.query.call(self, 'show tables');
			case 'deleteTable':
				return self.query.call(self, 'DROP TABLE ' + query);
			case 'listAllIn':
				return self.query.call(self, 'select * from ' + query);
			case 'listIn':
				return self.query.call(self, 'select * from ' + query.target + ' where ' + query.filter);
			case 'update':
				return self.query.call(self, 'update ' + query.target + ' set ' + query.data + ' where ' + query.filter);
			case 'delete':
				return self.query.call(self, 'delete from ' + query.target + ' where ' + query.filter);
		}
		return 'Undefined Query Type';
	}

	/**
	 * @param {string} query
	 */
	query (query) {
		const self = this;
		return new Promise(resolve => {
			if (!self.loaded) {
				self.lastError = 'Database is not loaded';
				resolve('Database is not loaded');
				return;
			}
			// self.connection.connect();

			self.connection.query(
				query,
				function (err, results) {
					if (err) {
						self.lastError = err.message;
						console.error(err.message);
						resolve(err.message);
						return;
					}
					// self.connection.end();
					resolve(results);
				}
			);
		});
	}
}

module.exports = {
	MySQLClass: MySQLClass
};

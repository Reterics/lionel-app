const MongoClient = require('mongodb').MongoClient;

class MongoDBClass {
	constructor () {
		this.loaded = false;
		this.lastError = null;
		this.config = {
			host: 'localhost',
			database: 'database',
			username: '',
			password: '',
			port: 27017,
		};
		const self = this;
		this.getURI = function () {
			if (self.config.username && self.config.password) {
				return 'mongodb://' + self.config.username + ':' + self.config.password + '@' + self.config.host + ':' + self.config.port + '/' + self.config.database;
			}
			return 'mongodb://' + self.config.host + ':' + self.config.port + '/' + self.config.database;
		};
	}

	/**
	 *
	 * @param {Object} config
	 * @param {string} config.host
	 * @param {string} config.database
	 * @param {number} config.port
	 */
	init (config) {
		const self = this;
		self.config = config;
		// Use connect method to connect to the server
		MongoClient.connect(self.getURI(), { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
			if (err) {
				self.lastError = 'Failed to connect ' + self.config.host;
				console.error('MongoDB: ' + err.message);
				return;
			}
			self.loaded = true;
			client.db(self.config.database);

			console.log('Connected successfully to server');

			client.close();
		});
	}

	_handleQuery (queryType, query) {
		const self = this;

		switch (queryType) {
			case 'type':
				return 'mongodb';
			case 'find':
				return self.find.call(self, query);
			case 'update':
				return self.update.call(self, query);
			case 'delete':
				return self.delete.call(self, query);
			case 'add':
				return self.add.call(self, query);
			case 'list':
				return self.collections.call(self);
			case 'listIn':
				return self.find.call(self, { collection: query });
		}
		return 'Undefined Query Type';
	}

	collections () {
		const self = this;

		return new Promise(resolve => {
			if (!self.loaded) {
				resolve('Database is not loaded');
				return;
			}
			MongoClient.connect(self.getURI(), { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
				if (err) {
					self.lastError = 'Failed to connect ' + self.config.host;
					resolve(self.lastError);

					return;
				}

				self.loaded = true;
				const db = client.db(self.config.database);
				db.listCollections().toArray(function (err, collInfos) {
					if (err) {
						self.lastError = 'Failed to list in  ' + self.config.host;
						resolve(self.lastError);
						return;
					}
					resolve(collInfos);
					client.close();
				});
			});
		});
	}

	/**
	 *
	 * @param query
	 * @param query.collection
	 * @param query.object
	 * @returns {Promise<any>}
	 */
	find (query) {
		const self = this;

		return new Promise(resolve => {
			if (!self.loaded) {
				resolve('Database is not loaded');
				return;
			}
			MongoClient.connect(self.getURI(), { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
				if (err) {
					self.lastError = 'Failed to connect ' + self.config.host;
					resolve(self.lastError);

					return;
				}
				self.loaded = true;
				const db = client.db(self.config.database);

				const collection = db.collection(query.collection);
				// Find some documents
				collection.find(query.object).toArray(function (err, docs) {
					if (err) {
						self.lastError = 'Failed to find in  ' + self.config.host;
						resolve(self.lastError);
						return;
					}
					resolve(docs);
					client.close();
				});
			});
		});
	}

	/**
	 *
	 * @param query
	 * @param query.collection
	 * @param query.object
	 * @param query.details
	 * @returns {Promise<any>}
	 */
	update (query) {
		const self = this;

		return new Promise(resolve => {
			if (!self.loaded) {
				resolve('Database is not loaded');
				return;
			}
			MongoClient.connect(self.getURI(), { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
				if (err) {
					self.lastError = 'Failed to connect ' + self.config.host;
					resolve(self.lastError);

					return;
				}
				self.loaded = true;
				const db = client.db(self.config.database);

				const collection = db.collection(query.collection);
				// Find some documents
				collection.update(query.object, query.details, function (err, result) {
					if (err) {
						self.lastError = 'Failed to update document in  ' + self.config.host;
						resolve(self.lastError);
						return;
					}
					resolve(result);
					client.close();
				});
			});
		});
	}

	/**
	 *
	 * @param query
	 * @param query.collection
	 * @param query.object
	 * @returns {Promise<any>}
	 */
	delete (query) {
		const self = this;

		return new Promise(resolve => {
			if (!self.loaded) {
				resolve('Database is not loaded');
				return;
			}
			MongoClient.connect(self.getURI(), { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
				if (err) {
					self.lastError = 'Failed to connect ' + self.config.host;
					resolve(self.lastError);

					return;
				}
				self.loaded = true;
				const db = client.db(self.config.database);

				const collection = db.collection(query.collection);
				// Find some documents
				collection.delete(query.object, function (err, result) {
					if (err) {
						self.lastError = 'Failed to delete document in  ' + self.config.host;
						resolve(self.lastError);
						return;
					}
					resolve(result);
					client.close();
				});
			});
		});
	}

	/**
	 *
	 * @param query
	 * @param query.collection
	 * @param query.object
	 * @returns {Promise<any>}
	 */
	add (query) {
		const self = this;

		return new Promise(resolve => {
			if (!self.loaded) {
				resolve('Database is not loaded');
				return;
			}
			MongoClient.connect(self.getURI(), { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
				if (err) {
					self.lastError = 'Failed to connect ' + self.config.host;
					resolve(self.lastError);

					return;
				}
				self.loaded = true;
				const db = client.db(self.config.database);

				const collection = db.collection(query.collection);
				// Find some documents
				collection.insertOne(query.object, function (err, result) {
					if (err) {
						self.lastError = 'Failed to insert document in  ' + self.config.host;
						resolve(self.lastError);
						return;
					}
					resolve(result);
					client.close();
				});
			});
		});
	}
}

module.exports = {
	MongoDBClass: MongoDBClass
};

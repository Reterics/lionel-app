const {Lionel} = require('../../bin/LionelClass');

/**
 * We can add server side endpoints for Lionel.call requests in here
 */
Lionel.methods({
	/**
	 * This can be called with Lionel.call('getSampleText',..args,callback) returns Promise
	 * @returns {string}
	 */
	getSampleText: function () {
		return 'Text'
	},
	/**
	 * This can be called with Lionel.call('getSampleJSON',..args,callback) returns Promise
	 * @returns {string}
	 */
	getSampleJSON: function () {
		return {
			status:'JSON value'
		}
	},
});

console.log('Server Started....');

'use strict';
/**
 * @typedef {Object} argumentElement
 * @property {string} type
 * @property {string} value
 */

/**
 * Get a list from the command line arguments
 * @returns {argumentElement[]}
 */
const parseArguments = function () {
	const argumentList = [];
	if (process.argv.length > 2) {
		for (let i = 2; i < process.argv.length; i++) {
			if (process.argv[i].charAt(0) === '-') {
				const pieces = process.argv[i].substring(1).split('=');
				const argument = {
					type: pieces[0],
					value: !pieces[1] ? true : pieces[1] === 'false' ? false : pieces[1] === 'true' ? true : pieces[1]
				};
				argumentList.push(argument);
			}
		}
	}

	return argumentList;
};

/**
 * Get value for a specific command line argument
 * @param {string} type
 * @param {argumentElement[]} argumentList
 * @returns {string|boolean}
 */
const getArgumentValue = function (type, argumentList) {
	if (!type || !Array.isArray(argumentList)) {
		return false;
	}

	let value = false;
	argumentList.forEach(function (a) {
		if (a && a.type && a.type === type) {
			value = a.value || false;
		}
	});
	return value;
};

module.exports = {
	parseArguments, getArgumentValue
};

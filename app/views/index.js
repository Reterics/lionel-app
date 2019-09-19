const { LionelClient } = require('../globals');
const { sampleObject } = require('../lib/exampleLibary');
console.log('Index js is loaded: ' + sampleObject.resultObject);

LionelClient.call('getSampleText', function (error, result) {
	console.log(error, result);
});

LionelClient.call('getSampleJSON').then(function (result) {
	console.log(result);
}).catch(function (error) {
	console.warn(error);
});

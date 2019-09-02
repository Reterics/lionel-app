const { Lionel } = require('../globals');
const { sampleObject } = require('../lib/exampleLibary');
console.log('Index js is loaded: ' + sampleObject.resultObject);

Lionel.call('getSampleText',function (error, result) {
	console.log(error,result)
});

Lionel.call('getSampleJSON').then(function (result) {
	console.log(result);
}).catch(function (error) {
	console.warn(error);
});
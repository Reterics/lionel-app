const { LionelClient } = require('../globals');
const { sampleObject } = require('../lib/exampleLibary');
const Helper = LionelClient.Helper;
console.log('Index js is loaded: ' + sampleObject.resultObject);

LionelClient.call('getSampleText',function (error, result) {
	console.log(error,result)
});

LionelClient.call('getSampleJSON').then(function (result) {
	console.log(result);
}).catch(function (error) {
	console.warn(error);
});

const formContainer = document.querySelector('.placeOfForm');
if (formContainer) {
	const selectInput = Helper.createSelector(['option1','option2'],{label:'label',className:'form-control'}).node;

	const formObject = Helper.createForm({
		username:{label:'Username: ',placeholder:'user',className:'form-control'},
		password:{label:'Password: ',placeholder:'password',type:'password',className:'form-control'},
		selector:selectInput,
		details:{label:'Details: ',placeholder:'details',name:'details',className:'form-control'},
	},{
		title:'Title of the Sample form',
		className:'form-control'
	});

	formContainer.appendChild(formObject.node)
}

const tableContainer = document.querySelector('.placeOfTable');
if (tableContainer) {

	const header = ['First Column','Second Column','Third Column'];

	const linesOfTable = [
		['0.','First data',new Date().toLocaleString()],
		['1.','Second data',new Date().toLocaleString()],
		['2.','Third data',new Date().toLocaleString()],
	];

	const table = Helper.createTable(linesOfTable,{
		header:header,
		classList:['table','table-striped'],
		events:{
			onclick:function (data) {
				console.log(data);
			}
		}
	});

	tableContainer.appendChild(table.node);
}

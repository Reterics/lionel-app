const { LionelClient } = require('../globals');
LionelClient.getPublicJS('jquery;popper;bootstrap;holder')
	.then(() => {
		console.log('Every javascript are loaded');
	})
	.catch(error => {
		console.error(error);
	});

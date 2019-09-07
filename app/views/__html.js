const { LionelClient } = require('../globals');

LionelClient.getPublicJS('jquery;popper;bootstrap;holder',function () {
	Holder.addTheme('thumb', {
		bg: '#55595c',
		fg: '#eceeef',
		text: 'Thumbnail'
	});
});

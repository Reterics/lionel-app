LionelClient.getPublicJS('jquery;popper;bootstrap;holder')
	.then(()=>{
		console.log('Every javascript are loaded');
		Holder.addTheme('thumb', {
			bg: '#55595c',
			fg: '#eceeef',
			text: 'Thumbnail'
		});
	})
	.catch(error=>{
	console.error(error);
});

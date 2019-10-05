/**
 * This kind of method make sure that Header will load only one time instead of Refreshing all the time.
 * @type {Element}
 */
const header = document.querySelector('body > header.main');
if (!header) {
	const navigation = LionelClient.Helper.createNavHeader({
		title: 'Lionel App',
		icon: 'logoWhite.png',
		colorScheme: 'dark',
		items: ['index'],
		default: 'index'
	}).node;
	const node = document.createElement('header');
	node.classList.add('main');
	node.appendChild(navigation);

	document.body.insertBefore(node,document.querySelector('.LionelPageContent'));
}

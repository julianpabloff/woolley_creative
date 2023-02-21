const ContactComponent = function(root) {
	console.log('running contact comp');
	document.title = 'Contact – Woolley Creative';
	const header = document.getElementById('header');
	const headerHeight = header.clientHeight;
	const slideouts = new SlideoutManager(document, headerHeight + 50, 50);

	this.update = function() {
		slideouts.update();
	}
}

export default ContactComponent;

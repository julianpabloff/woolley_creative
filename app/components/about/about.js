const AboutComponent = function(container) {
	this.container = container;
	document.title = 'About – Woolley Creative';
	const header = document.getElementById('header');
	const headerHeight = header.clientHeight;
	const slideouts = new SlideoutManager(document, headerHeight + 50, 50);

	const slideListElement = document.getElementById('about-slide-list');
	const slideList = new SlideListAnimation(slideListElement).start();

	this.update = function() {
		slideouts.update();
	}
}

export default AboutComponent;

const CareersComponent = function(container) {
	this.container = container;
	const parallaxScrolls = new ParallaxScrollManager(this.container, 0.2);
	parallaxScrolls.update();

	this.update = function() {
		parallaxScrolls.update();
	}
}

export default CareersComponent;

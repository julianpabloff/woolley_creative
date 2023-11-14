import { getBoundedTValue, ScrollTracker } from '../animations.js';

export class BackgroundParallax {
	constructor(element) {
		this.element = element;
		this.tracker = new ScrollTracker(element);
		this.displacement = 200;
		element.style.backgroundRepeat = 'no-repeat';
		this.onResize();
	}

	onScroll(scrollY = window.scrollY) {
		this.tracker.onScroll(scrollY);
		if (this.tracker.visible)
			this.element.style.backgroundPositionY =
				(this.displacement * this.tracker.t).toString() + 'px';
	}

	onResize() {
		this.tracker.onResize();
		this.onScroll();
	}
}

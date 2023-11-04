import { getBoundedTValue, ScrollTracker } from '../animations.js';

export class BackgroundParallax {
	constructor(element) {
		this.element = element;
		this.tracker = new ScrollTracker(element);
		this.displacement = 200;
		element.style.backgroundRepeat = 'no-repeat';
		this.onResize();
	}

	onScroll() {
		this.tracker.onScroll(window.scrollY);
		this.element.style.backgroundPositionY =
			(this.displacement * this.tracker.scrollT).toString() + 'px';
	}

	onResize() {
		this.tracker.onResize();
		this.onScroll();
	}
}

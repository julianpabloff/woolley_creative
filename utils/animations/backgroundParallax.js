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
		this.tracker.onScroll();
		this.element.style.backgroundPositionY =
			(this.displacement * this.tracker.t).toString() + 'px';
	}

	onResize() {
		this.tracker.onResize();
		this.onScroll();
	}
}

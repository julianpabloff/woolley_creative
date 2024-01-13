import { getBoundedTValue, ScrollTracker } from '../animations.js';
import { getScrollY } from '../elements.js';

export class ScrollFadeOut { // class="scroll-fade-out"
	constructor(element, options = {}) {
		this.element = element;
		element.classList.add('scroll-fade-out');

		// Options
		const { outPadding, maxOpacity, threshold } = options;
		this.outPadding = outPadding !== undefined ? outPadding : 50;
		this.maxOpacity = maxOpacity !== undefined ? maxOpacity : 1;
		this.threshold = threshold !== undefined ? threshold : 0;

		this.tracker = new ScrollTracker(element, {
			outPadding: element.clientHeight + this.outPadding
		});

		this.onScroll();
	}

	onScroll(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		if (!this.tracker.changed) return;
		const opacity = 1 - getBoundedTValue(this.threshold, this.tracker.t, 1);
		this.element.style.opacity = opacity.toString();
	}

	onResize() {
		this.tracker.onResize();
		this.onScroll();
	}
}

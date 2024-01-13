import { getBoundedTValue, ScrollTracker } from '../animations.js';
import { getHeaderHeight, getScrollY, getVPH } from '../elements.js';

export class ImageParallax { // class="image-parallax"
	constructor(element) {
		this.element = element;
		element.classList.add('image-parallax');

		const src = element.dataset.src;
		if (src) element.style.backgroundImage = `url(${src})`;
		console.log('src', src);

		this.tracker = new ScrollTracker(element);
		this.factor = 0.2; // between 0 and 1

		this.onResize();
		console.log(element);
	}

	onScroll(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		if (!this.tracker.changed) return;

		const pixels = this.tracker.distance - this.tracker.total / 2;
		const displacement = pixels * this.factor + this.offsetY;

		// console.log(this.tracker.t);

		this.element.style.backgroundPositionY = `${displacement}px`;
	}

	onResize() {
		const height = this.element.clientHeight;
		const total = getVPH() - getHeaderHeight();
		const extra = (total - height) * this.factor;
		const aspect = this.element.clientWidth / height;

		const newWidth = (height + extra) * aspect;
		this.element.style.backgroundSize = `${newWidth}px`;

		this.offsetY = extra / -2;

		this.tracker.onResize();
		this.onScroll();
	}
}

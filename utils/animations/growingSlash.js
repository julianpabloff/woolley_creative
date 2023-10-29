import { getBoundedTValue, ScrollTracker } from '../animations.js';
import { getAbsoluteOffset } from '../elements.js';

export class GrowingSlash {
	constructor(element) {
		this.element = element;
		this.thickness = window.getComputedStyle(element).getPropertyValue('--thickness');
		this.tracker = new ScrollTracker(element);
	}

	onScroll() {
		this.tracker.onScroll(window.scrollY);

		let t = this.tracker.scrollT;
		t = t * 20 + 80; // min slash length 80%
		const u = 100 - t;

		const bl = `calc(${u}% + ${this.thickness} * ${u / 100}) ${100 - u}%`;
		const tl = `calc(${t}% - ${this.thickness}) ${(u)}%`;
		const tr = `${t}% ${u}%`;
		const br = `calc(${u}% + ${this.thickness} * ${1 + u / 100}) ${(100 - u)}%`;

		this.element.style.clipPath = `polygon(${bl}, ${tl}, ${tr}, ${br})`;
	}

	onResize() {
		this.tracker.onResize();
	}
}

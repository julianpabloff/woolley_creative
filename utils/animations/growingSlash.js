import { getBoundedTValue, ScrollTracker } from '../animations.js';
import { getScrollY, setDebug } from '../elements.js';

export class GrowingSlash {
	constructor(element) {
		this.element = element;
		this.tracker = new ScrollTracker(element);
		this.onResize();
	}

	onScroll(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);

		let t = this.tracker.t;
		const minSize = 0.6; // 60% minimum size
		t = (1 - minSize) / 2 * t + (1 - (1 - minSize) / 2);

		const u = 1 - t;
		const T = t * 100;
		const U = u * 100;
		const k = this.thickness;

		const bl = `calc(${U}% - ${k} * ${u}) ${T}%`;
		const tl = `calc(${T}% - ${k} * ${t}) ${U}%`;
		const tr = `calc(${T}% + ${k} * ${u}) ${U}%`;
		const br = `calc(${U}% + ${k} * ${t}) ${T}%`;

		this.element.style.clipPath = `polygon(${bl}, ${tl}, ${tr}, ${br})`;
		// setDebug(`
		// 	<p><b>growingSlash</b></p>
		// 	<p>computed thickness: ${this.thickness}<p>
		// 	<p>clip-path: ${this.element.style.clipPath}</p>
		// `);
	}

	onResize() {
		this.tracker.onResize();
		this.thickness = window.getComputedStyle(this.element).getPropertyValue('--thickness');
		this.onScroll();
	}
}

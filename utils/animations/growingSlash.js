import { getBoundedTValue } from '../animations.js';
import { getAbsoluteOffset } from '../elements.js';

export class GrowingSlash {
	constructor(element) {
		this.element = element;
		this.onScroll();
	}

	onScroll() {
		const scrollY = window.scrollY;

		const top = getAbsoluteOffset(this.element, 'top');
		const headerHeight = document.getElementById('header').clientHeight;
		const beginning = top - window.innerHeight;
		const end = top + this.element.clientHeight - headerHeight;

		let t = getBoundedTValue(beginning, scrollY, end);
		t = t * 25 + 75; // min slash length 80%
		const u = 100 - t;

		const thickness = '1.1rem';
		const bl = `calc(${u}% + ${thickness} * ${u / 100}) ${100 - u}%`;
		const tl = `calc(${t}% - ${thickness}) ${(u)}%`;
		const tr = `${t}% ${u}%`;
		const br = `calc(${u}% + ${thickness} * ${1 + u / 100}) ${(100 - u)}%`;

		this.element.style.clipPath = `polygon(${bl}, ${tl}, ${tr}, ${br})`;
	}

	onResize() {}
}

import { getBoundedTValue } from '../animations.js';
import { getAbsoluteY, getHeaderHeight } from '../elements.js';

export class ScrollTracker {
	constructor(element, options = {}) {
		this.element = element;

		// Options
		const { accountForHeader, inPadding } = options;
		this.accountForHeader = accountForHeader != undefined ? accountForHeader : true;
		this.inPadding = inPadding != undefined ? inPadding : 0;

		this.onResize();
	}

	onScroll(scrollY = window.scrollY) {
		this.t = getBoundedTValue(this.start + this.inPadding, scrollY, this.end);
	}

	onResize() {
		const top = getAbsoluteY(this.element);
		const windowHeight = window.innerHeight;
		this.height = this.element.clientHeight;
		this.start = (top - windowHeight) * (top > windowHeight);
		this.end = top + this.height - getHeaderHeight() * this.accountForHeader;
	}
}

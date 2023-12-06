import { getTValue, getBoundedTValue } from '../animations.js';
import { getAbsoluteY, getHeaderHeight } from '../elements.js';

export class ScrollTracker {
	constructor(element, options = {}) {
		this.element = element;

		// Options
		const { accountForHeader, inPadding, outPadding } = options;
		this.accountForHeader = accountForHeader != undefined ? accountForHeader : true;
		this.inPadding = inPadding != undefined ? inPadding : 0;
		this.outPadding = outPadding != undefined ? outPadding : 0;

		this.changed = false;
		this.visible = true;
		this.onResize();
	}

	onScroll(scrollY = window.scrollY) {
		const previousT = this.t;
		this.t = getBoundedTValue(this.start + this.inPadding, scrollY, this.end - this.outPadding);
		this.changed = this.t != previousT;

		// viewport t, without bounding or padding
		let vpt = getTValue(this.start, scrollY, this.end);
		this.visible = vpt >= 0 && vpt <= 1;
	}

	onResize() {
		const top = getAbsoluteY(this.element);
		const windowHeight = window.innerHeight;
		this.height = this.element.clientHeight;
		this.start = (top - windowHeight) * (top > windowHeight);
		this.end = top + this.height - getHeaderHeight() * this.accountForHeader;
	}
}

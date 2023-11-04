import { getBoundedTValue } from '../animations.js';
import { getAbsoluteOffset, getHeaderHeight } from '../elements.js';

export class ScrollTracker {
	constructor(element, accountForHeader = true) {
		this.element = element;
		this.accountForHeader = accountForHeader;
		this.onResize();
	}

	onScroll(scrollY) {
		this.scrollT = getBoundedTValue(this.start, scrollY, this.end);
	}

	onResize() {
		const top = getAbsoluteOffset(this.element, 'top');
		const windowHeight = window.innerHeight;
		this.height = this.element.clientHeight;
		this.start = (top - windowHeight) * (top > windowHeight);
		this.end = top + this.height - getHeaderHeight() * this.accountForHeader;
	}
}

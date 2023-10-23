import { getAbsoluteOffset } from '../elements.js';
import { getBoundedTValue } from '../animations.js';

export class ScrollFadeInElement {
	constructor(element, options) {
		const {
			inPadding, // px - How many pixels from the bottom to wait before fading in (default 0)
			threshold, // 0-1 - At what percentage down the element, when that point reaches
			           // halfway up the viewport, the element will be fully faded in (default 0.5)
			maxOpacity, // 0-1 - Maximum opacity that is reached (default 1)
		} = options;

		this.element = element;
		this.element.style.transition = 'opacity 0.1s';

		this.inPadding = inPadding !== undefined ? inPadding : 0;
		this.threshold = threshold !== undefined ? threshold : 0.5;
		this.maxOpacity = maxOpacity !== undefined ? maxOpacity : 1;
	}

	onScroll(scrollY) {
		const top = getAbsoluteOffset(this.element, 'top');
		const height = this.element.clientHeight;
		const windowHeight = window.innerHeight;

		// scrollY value that the element starts to fade in
		const beginning = top - windowHeight + this.inPadding;
		// scrollY value that the element is fully faded in
		const end = top + height * this.threshold - windowHeight / 2;

		let opacity = getBoundedTValue(beginning, scrollY, end);
		// if (opacity < 0) opacity = 0;
		// else if (opacity > 1) opacity = 1;
		opacity *= this.maxOpacity;

		this.element.style.opacity = opacity > 0 ? opacity.toString() : '0';
	}
}

export class ScrollFadeInGroup {
	constructor(offset = 90, inPadding = 0, threshold = 0) {
		this.offset = offset;
		this.doOffset = true;
		this.inPadding = inPadding;
		this.threshold = threshold;
		this.members = [];
	}

	addElement(element) {
		const inPadding = this.inPadding + this.members.length * this.offset * this.doOffset;
		const member = new ScrollFadeInElement(element, { inPadding, threshold: this.threshold });
		this.members.push(member);
		return member;
	}

	toggleOffset(boolean) {
		if (this.doOffset !== boolean) {
			let i = 0;
			while (i < this.members.length) {
				const member = this.members[i];
				member.inPadding = this.inPadding + i * this.offset * boolean;
				i++;
			}
		}
		this.doOffset = boolean;
	}

	onScroll(scrollY) {
		this.members.forEach(member => member.onScroll(scrollY));
	}
}

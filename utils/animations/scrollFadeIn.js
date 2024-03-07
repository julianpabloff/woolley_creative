import { getBoundedTValue, ScrollTracker } from '../animations.js';
import { forEachElement, getScrollY } from '../elements.js';

/* ScrollFadeIn OPTIONS

	inPadding [px] - How many pixels from the bottom to start fading in the element.

	maxOpacity [0-1] - The maximum opacity the element should reach.

	threshold [0-1] - How far up the viewport the element should finish fading in.
*/

export class ScrollFadeIn { // class="scroll-fade-in"
	constructor(element, options = {}) {
		this.element = element;
		element.classList.remove('scroll-fade-in');
		element.classList.add('scroll-fade-in-element');

		// Options
		const { inPadding, maxOpacity, threshold } = options;
		this.inPadding = inPadding !== undefined ? inPadding : 100;
		this.maxOpacity = maxOpacity !== undefined ? maxOpacity : 1;
		this.threshold = threshold !== undefined ? threshold : 0.5;

		this.tracker = new ScrollTracker(element, { inPadding: this.inPadding });
		this.onScroll();
	}

	onScroll(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		if (!this.tracker.changed) return;
		const opacity = getBoundedTValue(0, this.tracker.t, this.threshold) * this.maxOpacity;
		this.element.style.opacity = opacity;
	}

	onResize() {
		this.tracker.onResize();
		this.onScroll();
	}
}

/* ScrollFadeInGroup OPTIONS

	gridWidth - The width of the grid of children in the container. If a responsive design is used,
	this will change from 1 to the total amount of children. E.x. A grid of 4 items will go from
	4 -> 2 -> 1 gridWidth as the viewport width shrinks. The gridWidth determines how to apply the
	offset of the fade in between the children.

	inPadding [px] - How many pixels from the bottom to start fading in the element.

	offset [px] - The amount of scroll pixels to offset the fade in of the children by.

	maxOpacity & threshold - Properties passed onto ScrollFadeIn for each child.
*/

export class ScrollFadeInGroup {
	constructor(container, options = {}) {
		this.container = container;

		// Options
		const { gridWidth, inPadding, offset, maxOpacity, threshold } = options;
		this.inPadding = inPadding != undefined ? inPadding : 0;
		this.offset = offset != undefined ? offset : 0.5;

		// Create ScrollFadeIn for each child with options above
		this.elementFadeIns = [];
		forEachElement(container.children, (child, index) => {
			const fadeIn = new ScrollFadeIn(child, { inPadding: this.inPadding, maxOpacity, threshold });
			// fadeIn.element.style.transition = 'opacity 0.1s';
			this.elementFadeIns.push(fadeIn);
		});

		// This sets the offset of the elementFadeIns (by calling the set function below)
		this.gridWidth = gridWidth != undefined ? gridWidth : container.children.length;
		this.onResize();
	}

	get gridWidth() { return this._gridWidth; }

	set gridWidth(width) {
		if (this._gridWidth != width) {
			let i = 0;
			this.elementFadeIns.forEach(fadeIn => {
				fadeIn.tracker.inPadding = (this.inPadding + this.offset * (i % width));
				i++;
			});
			this._gridWidth = width;
		}
	}

	onScroll(scrollY = getScrollY()) {
		this.elementFadeIns.forEach(fadeIn => fadeIn.onScroll(scrollY));
	}

	onResize() {
		const height = this.container.clientHeight;
		this.offsetPixels = height * this.offset;

		let i = 0;
		this.elementFadeIns.forEach(fadeIn => {
			// Reset inPaddings
			fadeIn.tracker.inPadding = (this.inPadding + this.offsetPixels * (i % this._gridWidth));
			fadeIn.onResize();
			i++;
		});
	}
}

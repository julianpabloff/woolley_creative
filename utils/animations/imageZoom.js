import { ScrollTracker } from '../animations.js';
import { getHeaderHeight, getScrollY, getVPH } from '../elements.js';

export class ImageZoom { // class="image-zoom"
	constructor(container, src = '', amount = 0.15) {
		this.container = container;

		const imgsInContainer = this.container.getElementsByTagName('IMG');
		if (imgsInContainer.length) {
			this.image = imgsInContainer[0];
		} else {
			this.image = document.createElement('img');
			this.image.src = container.dataset.src || src;
			delete container.dataset.src;
			container.appendChild(this.image);
		}

		console.log(this.image);
		this.amount = amount;
		this.tracker = new ScrollTracker(container);
		this.onResize();
	}

	onScroll(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		const scale = 1 + this.amount * this.tracker.t;
		this.image.style.transform = `scale(${scale}`;
	}

	onResize() {
	}
}

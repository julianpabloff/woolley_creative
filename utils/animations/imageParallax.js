import { ScrollTracker } from '../animations.js';
import { getHeaderHeight, getScrollY, getVPH } from '../elements.js';

export class ImageParallax { // class="image-parallax"
	constructor(container, src = '', factor = 0.05) {
		this.container = container;
		container.classList.add('image-parallax-container');

		// Checks for image in container. If nothing, creates one
		const imgsInContainer = this.container.getElementsByTagName('IMG');
		if (imgsInContainer.length) {
			this.image = imgsInContainer[0];
			this.setImageSize = false;
		} else {
			this.image = document.createElement('img');
			this.image.src = container.dataset.src || src;
			delete container.dataset.src;
			container.appendChild(this.image);
			this.setImageSize = true;
		}

		this.tracker = new ScrollTracker(container);
		this.factor = factor; // between 0 and 1

		this.onResize();
	}

	onScroll(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		if (!this.tracker.changed) return;

		const pixels = this.tracker.distance - this.tracker.total / 2;
		const displacement = pixels * this.factor + this.offsetY;

		this.image.style.transform = `translateY(${displacement}px)`;
	}

	onResize() {
		const width = this.container.clientWidth;
		const height = this.container.clientHeight;
		const total = getVPH() - getHeaderHeight();
		const extra = (total - height) * this.factor;

		const newHeight = height + extra;
		const newWidth = Math.floor(newHeight / height * width);

		if (newWidth > width) {
			this.image.style.height = `${height + extra}px`;
			this.image.style.width = 'auto';
		} else { // min-width: 100%;
			this.image.style.width = '100%';
			this.image.style.height = 'auto';
		}
		this.offsetY = extra / -2;

		this.tracker.onResize();
		this.onScroll();
	}
}

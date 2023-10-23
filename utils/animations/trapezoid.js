import { getTValue } from '../animations.js';
import { getAbsoluteOffset } from '../elements.js';

export class Trapezoid {
	constructor(container) {
		const content = document.createElement('div');
		content.classList.add('trapezoid-content');
		if (container.hasChildNodes())
			content.replaceChildren(...container.children);

		const contentContainer = document.createElement('div');
		contentContainer.classList.add('max-w', 'trapezoid-content-container');
		contentContainer.appendChild(content);

		const background = document.createElement('div');
		background.classList.add('trapezoid-background');

		container.classList.add('max-w-container');
		container.append(contentContainer, background);

		if (container.classList.contains('left')) this.draw = this.drawLeftTrapezoid;
		else if (container.classList.contains('right')) this.draw = this.drawRightTrapezoid;

		this.container = container;
		this.content = content;
		this.background = background;
		this.delta = background.clientHeight / 4;
		this.displacement = 150;

		this.onResize();
	}

	get distance() { return getTValue(this.start, window.scrollY, this.end) * this.displacement; }

	drawLeftTrapezoid() {
		const edgeX = this.contentX * 2 + this.contentW + this.displacement - this.distance;
		this.background.style.clipPath =
			`polygon(0 0, ${edgeX + this.delta}px 0, ${edgeX - this.delta}px 100%, 0 100%)`;
	}

	drawRightTrapezoid() {
		const distanceToEdge = window.innerWidth - this.contentX - this.contentW;
		const edgeX = this.contentX - distanceToEdge - this.displacement + this.distance;
		this.background.style.clipPath =
			`polygon(${edgeX - this.delta}px 0, 100% 0, 100% 100%, ${edgeX + this.delta}px 100%)`;
	}

	onScroll() {
		const scrollY = window.scrollY;
		if (scrollY >= this.start && scrollY <= this.end) this.draw();
	}

	onResize() {
		const windowHeight = window.innerHeight;
		this.start = getAbsoluteOffset(this.background, 'top') - windowHeight;
		this.end = this.start + windowHeight + this.background.clientHeight;
		this.contentX = getAbsoluteOffset(this.content, 'left');
		this.contentW = this.content.clientWidth;
		this.onScroll(window.scrollY)
	}
}

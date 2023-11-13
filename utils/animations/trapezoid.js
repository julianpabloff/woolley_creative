import { getTValue } from '../animations.js';
import { getAbsoluteX, getAbsoluteY, getHeaderHeight } from '../elements.js';

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

		// this.s = side multiplier (flips the sign of calculation values)
		if (container.classList.contains('left')) {
			this.s = 1;
			this.draw = this.drawLeftTrapezoid;
		}
		else if (container.classList.contains('right')) {
			this.s = -1;
			this.draw = this.drawRightTrapezoid;
		}
		if (container.classList.contains('double')) {
			this.double = true;
			this.draw = this.drawDoubleTrapezoid;
		}

		this.container = container;
		this.content = content;
		this.background = background;
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

	drawDoubleTrapezoid() {
		const firstEnd = this.firstX + this.firstW;
		const mean = (this.secondX - firstEnd) / 2;
		const edgeX = firstEnd + mean + (this.displacement / 2 - this.distance) * this.s;
		const delta = this.delta * this.s;
		this.background.style.clipPath =
			`polygon(0 0, ${edgeX + delta}px 0, ${edgeX - delta}px 100%, 0 100%)`;
	}

	drawStackedDoubleTrapezoid() {
		const firstEnd = this.firstY + this.firstH;
		const mean = (this.secondY - firstEnd) / 2;
		const asymmetry = 0.5 + 0.1 * this.s;
		const edgeX = window.innerWidth * asymmetry + (this.displacement / 2 - this.distance) * this.s;
		const delta = this.delta * this.s;
		this.background.style.clipPath =
			`polygon(0 0, ${edgeX + delta}px 0, ${edgeX - delta}px 100%, 0 100%)`;
	}

	onScroll(scrollY = window.scrollY) {
		if (scrollY >= this.start && scrollY <= this.end) this.draw();
	}

	onResize() {
		const windowHeight = window.innerHeight;
		this.start = getAbsoluteY(this.background) - windowHeight;
		this.end = this.start + windowHeight + this.background.clientHeight - getHeaderHeight();
		this.contentX = getAbsoluteX(this.content);
		this.contentW = this.content.clientWidth;
		this.delta = this.background.clientHeight / 4;

		if (this.double) {
			const first = this.content.children[0];
			const second = this.content.children[1];
			this.firstX = getAbsoluteX(first);
			this.firstY = first.offsetTop;
			this.firstW = first.clientWidth;
			this.firstH = first.clientHeight;
			this.secondX = getAbsoluteX(second);
			this.secondY = second.offsetTop;
			this.draw = (window.innerWidth > 767) ? this.drawDoubleTrapezoid : this.drawStackedDoubleTrapezoid;
		}

		this.onScroll(window.scrollY);
	}
}

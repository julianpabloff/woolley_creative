export async function intervalIterate(step, count, callback) {
	return new Promise(resolve => {
		let i = 0;
		const interval = setInterval(() => {
			callback(i);
			i++;
			if (i == count) {
				clearInterval(interval);
				resolve();
			}
		}, step);
	});
}

export class ScrollFadeInElement {
	constructor(element, offset = 0) {
		this.element = element;
		this.offset = offset;
		this.top = element.offsetTop;
		this.height = element.clientHeight;
		this.windowHeight = window.innerHeight;
		// this.element.style.transition = 'opacity 0.1s';
	}
	onScroll(scrollY) {
		const beginning = this.top - this.windowHeight + this.offset;
		const halfway = this.top + this.height / 2 - this.windowHeight / 2;
		const opacity = (scrollY - beginning) / (halfway - beginning);
		this.element.style.opacity = opacity > 0 ? opacity.toString() : '0';
	}
	onResize() {
		this.top = this.element.offsetTop;
		this.height = this.element.clientHeight;
		this.windowHeight = window.innerHeight;
	}
}

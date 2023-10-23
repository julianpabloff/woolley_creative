import { forEachElement } from '../elements.js';

export class SlideList {
	constructor(container, items, options = {}) {
		// Options
		this.delay = options.delay != undefined ? options.delay : 3000;
		this.speed = options.speed != undefined ? options.speed : 100;

		this.ul = document.createElement('ul');
		this.ul.className = 'slide-list';

		// Configure <li>
		items.forEach(text => {
			const li = document.createElement('li');
			const h6 = document.createElement('h6');
			h6.innerText = text;
			li.appendChild(h6);
			this.ul.appendChild(li);
		});
		this.items = this.ul.children;

		// Container
		this.container = container;
		container.className = 'slide-list-container';
		container.style.transition = `height ${this.speed / 1000}s linear`;
		container.appendChild(this.ul);

		this.setContainerHeight(this.currentHeight);
	}

	get currentHeight() { return this.items[0].clientHeight; }
	get nextHeight() { return this.items[1].clientHeight; }

	setContainerHeight(height) {
		this.container.style.height = height.toString() + 'px';
	}

	toggleTransition(on) {
		this.ul.style.transition = on ? `transform ${this.speed / 1000}s linear` : 'none';
	}

	move() {
		this.toggleTransition(true);
		this.ul.style.transform = `translateY(-${this.currentHeight}px)`;
		this.setContainerHeight(this.nextHeight);

		setTimeout(() => {
			this.ul.style.transform = 'translateY(0)';
			this.toggleTransition(false);
			this.ul.appendChild(this.ul.removeChild(this.items[0]));
			console.log('moved slide-list');
		}, this.speed);
	}

	start() { this.interval = setInterval(() => this.move(), this.delay); }
	stop() { clearInterval(this.interval); }
}

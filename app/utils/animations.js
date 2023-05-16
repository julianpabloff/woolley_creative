import { getAbsoluteOffset } from './elements.js';

export async function wait(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

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
	constructor(element, inPadding = 0, threshold = 0.5) {
		this.element = element;
		this.element.style.transition = 'opacity 0.1s';
		// How many pixels from the bottom to wait before fading in
		this.inPadding = inPadding;
		// At what percentage down the element, when that point reaches halfway up the
		// viewport, the element will be fully faded in
		this.threshold = threshold;
	}

	onScroll(scrollY) {
		const top = getAbsoluteOffset(this.element, 'top');
		const height = this.element.clientHeight;
		const windowHeight = window.innerHeight;

		// scrollY value that the element starts to fade in
		const beginning = top - windowHeight + this.inPadding;
		// scrollY value that the element is fully faded in
		const end = top + height * this.threshold - windowHeight / 2;

		let opacity = (scrollY - beginning) / (end - beginning);
		if (opacity < 0) opacity = 0;
		else if (opacity > 1) opacity = 1;

		this.element.style.opacity = opacity > 0 ? opacity.toString() : '0';
	}
}

export class ScrollFadeInGroup {
	constructor(offset = 90, inPadding = 0, outPadding = 0) {
		this.offset = offset;
		this.doOffset = true;
		this.inPadding = inPadding;
		this.outPadding = outPadding;
		this.members = [];
	}

	addElement(element) {
		const inPadding = this.inPadding + this.members.length * this.offset * this.doOffset;
		const member = new ScrollFadeInElement(element, inPadding, this.outPadding);
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

class SpriteSheet {
	constructor(spriteSheetData) {
		const { container, filepath, columns, count, imgWidth, imgHeight } = spriteSheetData;
		for (const [key, value] of Object.entries(spriteSheetData)) this[key] = value;

		container.style.overflow = 'hidden';
		container.style.display = 'flex';
		container.style.alignItems = container.style.justifyContent = 'center';

		const frame = document.createElement('div');
		frame.style.aspectRatio = imgWidth.toString() + '/' + imgHeight.toString();
		frame.style.backgroundImage = 'url(' + filepath + ')';
		frame.style.backgroundSize = 'calc(100% * ' + columns + ')';
		frame.style.backgroundPosition = '0px 0px';

		this.frame = frame;
		this.index = 0;
		this.onResize();

		container.innerHTML = '';
		container.appendChild(frame);

	}

	get y() { return getAbsoluteOffset(this.frame, 'top'); }
	get height() { return this.frame.clientHeight; }

	toFrame(index) {
		const x = index % this.columns;
		const y = Math.floor(index / this.columns);
		const rows = Math.ceil(this.count / this.columns);
		this.frame.style.backgroundPositionX = `calc(100% * ${x} / ${this.columns - 1}`;
		this.frame.style.backgroundPositionY = `calc(100% * ${y} / ${rows - 1}`;
		this.index = index;
	}

	onResize() {
		this.frame.style.width = this.frame.style.height = '0';
		if (this.container.clientWidth >= this.container.clientHeight) {
			this.frame.style.width = 'fit-content';
			this.frame.style.height = '100%';
		} else {
			this.frame.style.width = '100%';
			this.frame.style.height = 'fit-content';
		}
	}
}

export class SpriteSheetScroll {
	constructor(spriteSheetData, scrollYInterval = 50) {
		this.sprite = new SpriteSheet(spriteSheetData);
		this.interval = scrollYInterval;
	}

	onScroll(scrollY) {
		const windowHeight = window.innerHeight;
		const spriteY = this.sprite.y;
		const spriteHeight = this.sprite.height;
		const header = 100; // moves center point down by half of this value

		const start = spriteY - windowHeight;
		const center = spriteY + (spriteHeight - windowHeight - header) / 2;
		const end = spriteY + spriteHeight - header;

		if (scrollY >= start && scrollY <= end) {
			let index = Math.floor((scrollY - center) / this.interval) % this.sprite.count;
			if (index < 0) index += this.sprite.count;
			if (index != this.sprite.index) this.sprite.toFrame(index);
		}
	}
	
	onResize() {
		this.sprite.onResize();
	}
}


export class IntersectionAnimation {
	constructor({ initializer, options, run }) {
		this.elementInitializer = initializer;
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(async entry => {
				if (entry.isIntersecting) {
					const element = entry.target;
					run(element);
					observer.unobserve(element);
				}
			});
		}, options);
	}

	add(element) {
		this.elementInitializer(element);
		setTimeout(() => this.observer.observe(element), 250);
	}
}

// IntersectionObserver Animations
//     initializer: prepares element for the animation
//     options: IntersectionObserver options
//     run: runs the animation

const slideout = {
	initializer: element => {
		const x = getAbsoluteOffset(element, 'left');
		const width = element.clientWidth;
		const leftSide = x + width / 2 < window.innerWidth / 2;
		element.dataset.side = leftSide ? 'left' : 'right';
		element.style.opacity = '0';
	},
	options: {
		root: null,
		rootMargin: '-150px 0px -50px 0px',
		threshold: 0.5
	},
	run: async element => {
		const x = getAbsoluteOffset(element, 'left');
		const width = element.clientWidth;
		let offset;
		if (element.dataset.side == 'left') offset = 0 - x - width + 10;
		else if (element.dataset.side == 'right') offset = window.innerWidth - x - 10;
		element.style.transform = 'translateX(' + offset.toString() + 'px';

		await wait(10);
		const currentTranstion = window.getComputedStyle(element).transition;
		element.style.transition =
			window.getComputedStyle(element).transition +
			', transform 1s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s ease-in';
		element.style.transform = 'translateX(0px)';
		element.style.opacity = '1';
	}
}

const childrenFadeIn = {
	initializer: container => {
		for (const child of container.children) {
			child.style.opacity = '0';
			child.style.transform = 'scale(1.2)';
		}
	},
	options: {
		root: null,
		rootMargin: '-100px 0px 0px 0px',
		threshold: 0.5
	},
	run: container => {
		const count = container.children.length;
		intervalIterate(150, count, i => {
			const child = container.children.item(i);
			child.style.transition = 'transform 0.6s, opacity 0.8s';
			child.style.transform = 'none';
			child.style.opacity = '1';
		});
	}
}

// For using animations elsewhere (without the className)
export function SlideoutObserver() { return new IntersectionAnimation(slideout) }
export function ChildrenFadeInObserver() { return new IntersectionAnimation(childrenFadeIn) }

// Automatically set up IntersectionObserver Animations based on className
const classMap = new Map()
	.set('slideout', new SlideoutObserver())
	.set('fade-in-children', new ChildrenFadeInObserver())

// Call from the router, to add className based animation elements at the root level
export function addIntersectionAnimations(container) {
	classMap.forEach((animation, className) => {
		const elements = container.getElementsByClassName(className);
		if (elements.length) for (const element of elements) animation.add(element);
	});
}

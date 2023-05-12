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


// IntersectionObserver Animations
//     initializer: prepares element for the animation
//     options: IntersectionObserver options
//     run: runs the animation

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
		element.style.transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s ease-in';
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

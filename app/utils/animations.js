import { getAbsoluteOffset } from './elements.js';

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
	constructor(element, inPadding = 0, outPadding = 0) {
		this.element = element;
		this.inPadding = inPadding;
		this.outPadding = outPadding;
		this.element.style.transition = 'opacity 0.1s';
	}

	onScroll(scrollY) {
		const top = getAbsoluteOffset(this.element, 'top');
		const height = this.element.clientHeight;
		const windowHeight = window.innerHeight;

		const beginning = top - windowHeight + this.inPadding;
		const halfway = top + height / 2 - windowHeight / 2;
		let opacity = (scrollY - beginning) / (halfway - beginning);

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
		const member = new ScrollFadeInElement(element, inPadding, 0);
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
// Each must include an IntersectionObserver with a callback, and an add() method

export class SlideoutObserver {
	constructor() { // Set up IntersectionObserver
		const options = {
			root: null,
			rootMargin: '-50px 0px',
			threshold: 0.5
		}
		this.observer = new IntersectionObserver(this.callback, options);
	}

	add(element) { // Pre-process and observe each element
		const x = getAbsoluteOffset(element, 'left');
		const width = element.clientWidth;
		const leftSide = x + width / 2 < window.innerWidth / 2;
		element.dataset.side = leftSide ? 'left' : 'right';

		element.style.opacity = '0';
		this.observer.observe(element);
	}

	callback(entries, observer) { // Gets called when element intersects viewport
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const element = entry.target;
				console.log('revealing', element);
				const x = getAbsoluteOffset(element, 'left');
				const width = element.clientWidth;
				let offset;
				if (element.dataset.side == 'left') offset = 0 - x - width + 10;
				else if (element.dataset.side == 'right') offset = window.innerWidth - x - 10;
				element.style.transform = 'translateX(' + offset.toString() + 'px';
				setTimeout(() => {
					element.style.transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s ease-in';
					element.style.transform = 'translateX(0px)';
					element.style.opacity = '1';
					observer.unobserve(element);
				}, 10);
			}
		});
	}
}

// Automatically set up IntersectionObserver Animations based on className
const classMap = new Map()
	.set('slideout', new SlideoutObserver())

// Call from the router, to add className based animation elements at the root level
export function addIntersectionAnimations(container) {
	classMap.forEach((animation, className) => {
		const elements = container.getElementsByClassName(className);
		if (elements.length) for (const element of elements) animation.add(element);
	});
}

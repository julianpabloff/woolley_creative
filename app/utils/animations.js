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

const slideoutAnimation = {
	initializer: (element, leftSide) => {
		const container = document.createElement('div');
		container.style.width = 'fit-content';
		element.parentNode.insertBefore(container, element);
		container.appendChild(element);

		const x = getAbsoluteOffset(element, 'left');
		const width = element.clientWidth;
		let offset;
		if (leftSide) offset = 0 - x - width - 10;
		else offset = window.innerWidth - width + 10;

		element.style.opacity = '0';
		element.style.transform = 'translateX(' + offset.toString() + 'px';
		setTimeout(() =>
			element.style.transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s ease-in'
		, 0);

		return container;
	},
	options: {
		rootMargin: '-50px 0px',
		threshold: 1.0
	},
	callback: entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const element = entry.target.children.item(0);
				element.style.transform = 'translateX(0px)';
				element.style.opacity = '1';
				console.log('revealing', element);
			}
		});
	}
};

class IntersectionAnimation {
	constructor(animation, initializerArgs) {
		this.animation = animation;
		this.initializerArgs = initializerArgs;
		this.targets = [];
		this.observer = new IntersectionObserver(animation.callback, animation.options);
	}

	add(element) {
		const target = this.animation.initializer(element, ...this.initializerArgs);
		// Wait for the user to see the page for a bit before triggering the animation
		setTimeout(() => {
			this.observer.observe(target);
			this.targets.push(target);
		}, 250);
	}
}

const classMap = new Map()
	.set('slideout-left', new IntersectionAnimation(slideoutAnimation, [true]))
	.set('slideout-right', new IntersectionAnimation(slideoutAnimation, [false]))

// Call from the router, to add className based animation elements at the root level
export function addIntersectionAnimations(container) {
	classMap.forEach((intersectionAnimation, className) => {
		const elements = container.getElementsByClassName(className);
		if (elements.length) for (const element of elements) intersectionAnimation.add(element);
	});
}

/* Ehh
export class AnimationManager {
	constructor(animation) {
		this.animation = animation;
		this.members = [];
		this.methodMap = new Map();
	}

	add() {
		const member = new this.animation(...arguments);
		this.members.push(member);
		const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(member));
		methodNames.forEach(name => {
			if (name !== 'constructor') {
				const method = member[name];

				// Groups all elements' handlers by name (e.x. onScroll)
				if (!this.methodMap.has(name))
					this.methodMap.set(name, []);
				this.methodMap.get(name).push(method.bind(member));

				// Add public method with the handler name (e.x. onScroll) that calls
				// each members' handler of the same name
				if (!this[name]) this[name] = args =>
					this.methodMap.get(name).forEach(method => method(args));
			}
		});
		return member;
	}

	forEach(callback) {
		this.members.forEach(member => callback(member));
	}
}
*/

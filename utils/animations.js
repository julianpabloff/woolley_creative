import { loadCSS } from '../view-loader.js';
import { forEachElement, getAbsoluteOffset } from './elements.js';
import { addAnimationToListeners } from './events.js';

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

loadCSS('/utils/animations.css');

const getTValue = (start, point, end) => (point - start) / (end - start);


// Configurable Animations
//     must be instanciated in a view js file
//     configurable on an element to element basis

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

		// let opacity = (scrollY - beginning) / (end - beginning);
		let opacity = getTValue(beginning, scrollY, end);
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

		const frame = document.createElement('div');
		frame.style.aspectRatio = imgWidth.toString() + '/' + imgHeight.toString();
		frame.style.backgroundImage = 'url(' + filepath + ')';
		frame.style.backgroundSize = 'calc(100% * ' + columns + ')';
		frame.style.backgroundPosition = '0px 0px';

		this.frame = frame;
		this.index = 0;
		this.onResize();

		container.innerHTML = '';
		container.classList.add('sprite-sheet-container');
		container.appendChild(frame);

	}

	get y() { return getAbsoluteOffset(this.frame, 'top'); }
	get height() { return this.frame.clientHeight; }

	toFrame(index) {
		const x = index % this.columns;
		const y = Math.floor(index / this.columns);
		const rows = Math.ceil(this.count / this.columns);
		this.frame.style.backgroundPositionX = `calc(100% * ${x} / ${this.columns - 1})`;
		this.frame.style.backgroundPositionY = `calc(100% * ${y} / ${rows - 1})`;
		this.index = index;
	}

	onResize() {
		this.frame.className = 'frame';
		const landscape = this.container.clientWidth >= this.container.clientHeight;
		this.frame.className = landscape ? 'frame landscape' : 'frame portrait';
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

// Scroll Animations
//     must have an onScroll() and onResize() <-- no arguments!
//     must not have any constructor parameters other than element
//     which means behavior is not configurable element to element
//     you can still add configuarablity throught element class names

export class Trapezoid { // class="trapezoid {left/right}"
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
		element.style.opacity = '0';
		element.dataset.side = leftSide ? 'left' : 'right';
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
		for (const child of container.children)
			child.classList.add('children-fade-in', 'hidden');
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
			child.classList.replace('hidden', 'revealed');
		});
	}
}

// For using intersection animations elsewhere (without the className)
export function SlideoutObserver() { return new IntersectionAnimation(slideout) }
export function ChildrenFadeInObserver() { return new IntersectionAnimation(childrenFadeIn) }

// Automatically set up animations based on className
const intersectionClassMap = new Map()
	.set('slideout', new SlideoutObserver())
	.set('fade-in-children', new ChildrenFadeInObserver())

const scrollClassMap = new Map()
	.set('trapezoid', Trapezoid)

export function searchForAnimations(container) {
	scrollClassMap.forEach((ScrollAnimation, className) => {
		const elements = container.getElementsByClassName(className);
		if (elements.length) for (const element of elements) {
			const animation = new ScrollAnimation(element);
			addAnimationToListeners(animation);
		}
	});

	intersectionClassMap.forEach((animation, className) => {
		const elements = container.getElementsByClassName(className);
		if (elements.length) for (const element of elements) animation.add(element);
	});
}

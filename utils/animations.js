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

export class LandingImage {
	constructor(landingImageData) {
		const {
			container, // DOM element
			fgFilepath, // image filepath
			bgFilepath, // image filepath
			heroText, // array of words
			height, // px (default 100vh)
			initFgDisp, // px (default 100)
			heroTextY, // Between 0 and 1 (default .5)
			opacitySpeed // multiplier (default 4)
		} = landingImageData;

		container.className = "landing-container";
		container.style.height = height ? height : '100vh';

		this.heroText = document.createElement('div');
		this.heroText.className = 'hero-text';
		for (const text of heroText) {
			const h1 = document.createElement('h1');
			h1.innerText = text;
			this.heroText.appendChild(h1);
		}
		this.revealedH1s = []; // Wait to set opacity on scroll until init()

		if (fgFilepath) {
			this.fg = document.createElement('img');
			this.fg.src = fgFilepath;
			this.fg.className = 'landing-fg';
		}

		this.bg = document.createElement('img');
		this.bg.src = bgFilepath;

		this.overlay = document.createElement('div');
		this.overlay.className = 'landing-bg-overlay';

		// Initial values
		this.initFgDisp = initFgDisp !== undefined ? initFgDisp : 100;
		this.fgDispAmount = 100;
		this.bgParallax = 0.3; // multiplier
		this.heroInitY = heroTextY !== undefined ? heroTextY : 0.5; // between 0 and 1
		this.heroTextOffset = 75; // px
		this.heroFadeInOffset = 300; // ms
		this.heroVelocity = 0.0010; // multiplier
		this.heroOpacityFactor = opacitySpeed !== undefined ? opacitySpeed : 4 // multiplier
		this.accountForHeader = true;

		// Add to DOM
		container.appendChild(this.heroText);
		if (this.fg) {
			const fgHeightAdd = this.fgDispAmount - this.initFgDisp;
			this.fg.style.height = `calc(100% + ${fgHeightAdd.toString()}px`;
			container.appendChild(this.fg);
		}
		container.appendChild(this.bg);
		container.appendChild(this.overlay);

		this.onResize();
		this.setFgDisp(0);
		this.setBgDisp(0);
	}

	setFgDisp(displacement) {
		if (this.fg) this.fg.style.top = (this.initFgDisp - displacement).toString() + 'px';
	}

	setBgDisp(displacement) {
		this.bgDisp = displacement;
		this.heroY = this.initHeroDisp + displacement;
		this.heroText.style.transform = `translateY(${displacement.toString()}px)`;
		this.bg.style.top = this.overlay.style.top = (displacement * 2).toString() + 'px';
	}

	init() {
		forEachElement(this.heroText.children, (h1, index) => {
			this.revealedH1s.push(false);
			setTimeout(() => {
				h1.style.opacity = '1';
				setTimeout(() => this.revealedH1s[index] = true, 500);
			}, (index + 1) * this.heroFadeInOffset);
		});
		this.onScroll(window.scrollY);
	}

	onScroll(scrollY) {
		let scrollT = scrollY / (this.landingHeight - this.headerHeight);
		if (scrollT > 1) scrollT = 1;

		this.setFgDisp(this.fgDispAmount * scrollT);
		this.setBgDisp(this.landingHeight * scrollT * this.bgParallax);
		this.overlay.style.opacity = 1 - scrollT * (this.fg ? 2 : 1);

		forEachElement(this.heroText.children, (h1, index) => {
			const threshold = index * this.heroTextOffset;
			const displacement = Math.pow(scrollY - threshold, 2) * this.heroVelocity;

			h1.style.right = (displacement * (
				scrollY >= threshold && // delay until offset factor reached
				scrollY < this.landingHeight && // stop after scroll passes landing
				displacement < this.heroLeft + this.heroWidth // stop after text reaches left side
			)).toString() + 'px';

			if (this.revealedH1s[index] && scrollY >= threshold) // only apply opacity if revealed
				h1.style.opacity = 1 - displacement / (window.innerWidth / this.heroOpacityFactor);
		});
	}

	onResize() {
		this.headerHeight = this.accountForHeader ? document.getElementById('header').clientHeight : 0;
		this.landingHeight = this.bg.clientHeight;
		this.initHeroDisp = this.heroInitY * (this.landingHeight - this.heroText.clientHeight);
		this.heroText.style.top = this.initHeroDisp.toString() + 'px';
		this.heroY = this.initHeroDisp + this.bgDisp;
		this.heroLeft = this.heroText.offsetLeft;
		this.heroWidth = this.heroText.clientWidth;
	}
}

// Scroll Animations
//     must have an onScroll() and onResize() <-- no arguments!
//     must not have any constructor parameters other than element
//     which means behavior is not configurable element to element
//     you can still add configuarablity through element class names

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

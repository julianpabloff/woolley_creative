import { loadCSS } from './view-loader.js';
import { addAnimationToListeners, clearAnimationsFromListeners } from './events.js';

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

// T Values
export const getTValue = (start, point, end) => (point - start) / (end - start);
export function getBoundedTValue(start, point, end) {
	const t = getTValue(start, point, end);
	if (t < 0) return 0;
	if (t > 1) return 1;
	return t;
};

// Configurable Animations
//     must be instanciated in a view js file
//     configurable on an element to element basis

export { LandingImage } from './animations/landingImage.js';
export { LandingImageII } from './animations/landingImageII.js';
export { ScrollFadeIn, ScrollFadeInGroup } from './animations/scrollFadeIn.js';
export { ScrollFadeOut } from './animations/scrollFadeOut.js';
export { SlideList } from './animations/slideList.js';
export { SpriteSheet, SpriteSheetScroll } from './animations/spriteSheet.js';
export { ScrollTracker } from './animations/scrollTracker.js';

// Scroll Animations
//     must have an onScroll() and onResize() <-- no arguments!
//     must not have any constructor parameters other than element
//     which means behavior is not configurable element to element
//     you can still add configuarablity through element class names

import { BackgroundParallax } from './animations/backgroundParallax.js'; // class="background-parallax"
import { GrowingSlash } from './animations/growingSlash.js'; // class="growing-slash"
import { Trapezoid } from './animations/trapezoid.js'; // class="trapezoid {left/right}"

// IntersectionObserver Animations
//     initializer: prepares element for the animation
//     options: IntersectionObserver options
//     run: runs the animation

import { childrenFadeIn } from './animations/childrenFadeIn.js' // class="fade-in-children"
import { slideout } from './animations/slideout.js'; // class="slideout {left/right}"

class IntersectionAnimation {
	constructor({ initializer, options, run }) {
		this.elementInitializer = initializer;
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
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

// For using intersection animations elsewhere (without the className)
export function SlideoutObserver() { return new IntersectionAnimation(slideout) }
export function ChildrenFadeInObserver() { return new IntersectionAnimation(childrenFadeIn) }

// Automatically set up animations based on className
const intersectionClassMap = new Map()
	.set('slideout', new SlideoutObserver())
	.set('fade-in-children', new ChildrenFadeInObserver())

const scrollClassMap = new Map()
	.set('background-parallax', BackgroundParallax)
	.set('growing-slash', GrowingSlash)
	.set('trapezoid', Trapezoid)

export function searchForAnimations(container) {
	clearAnimationsFromListeners();
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

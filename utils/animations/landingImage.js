import { getBoundedTValue, ScrollTracker } from '../animations.js';
import { forEachElement, getScrollY, getVPH } from '../elements.js';

/* LandingImageII

	landingImageData:
	- container: [DOM element] container the landing image generates in
	- fgFilepath: [string] (url) foreground image filepath
	- bgFilepath: [string] (url) background image filepath
	- textPosition: [string || object] one of the position presets or an object with css key/value
	- textColor: [string] color className (default inherit)
	- textFade: ['slow', 'medium', 'fast', 'none'] how quickly the text fades out (default slow)
	- textSlide: [boolean] whether the text slides left (default true)
	- height: [number] (px) height of container (default viewport height)
	- minHeight: [number] (px) minimum size to default to
	- maxHeight: [number] (px) maximum size to default to
	- doHorizontalFgDisp: [bool] whether to move the fg sideways too (default true)
*/
export class LandingImage {
	constructor(landingImageData) {
		const {
			container, // DOM element
			fgFilepath, // filepath url
			bgFilepath, // filepath url
			textPosition, // preset or custom object
			textColor, // color className
			textFade, // slow, medium, fast, none
			textSlide, // boolean
			height, // px
			minHeight, // px
			maxHeight, // px
			doHorizontalFgDisp // boolean
		} = landingImageData;

		// Initial values
		this.totalDisplacement = 100; // px
		this.bgParallax = 0.6; // parallax factor (0 = no parallax, 1 = fixed)
		this.textParallax = 0.4; // parallax factor (0 = no parallax, 1 = fixed)
		this.fgXDispFactor = 0.67; // proportion of horizontal fg displacement
		this.textSlideOffset = 50; // px

		// From landingImageData
		this.doFgXDisp = doHorizontalFgDisp != undefined ? doHorizontalFgDisp : true;
		this.doTextSlide = textSlide != undefined ? textSlide : true;
		this.textPos = textPosition != undefined ? textPosition : 'right';
		this.textColor = textColor != undefined ? textColor : 'white';
		switch (textFade) {
			case undefined: case 'slow': this.textFadeFactor = 4; break;
			case 'medium': this.textFadeFactor = 8; break;
			case 'fast': this.textFadeFactor = 10; break;
			case 'none': this.textFadeFactor = 0; break;
		}

		container.className = 'landing-image';

		// Set container height
		let containerHeight;
		if (height) containerHeight = height;
		else {
			containerHeight = getVPH();
			if (minHeight) containerHeight = Math.max(containerHeight, minHeight);
			if (maxHeight) containerHeight = Math.min(containerHeight, maxHeight);
		}
		container.style.height = containerHeight.toString() + 'px';

		// Clip path overlay
		this.overlay = document.createElement('div');
		this.overlay.classList.add('landing-bg-overlay');
		this.overlay.style.clipPath =
			`polygon(60% 0, 100% 0, 100% 100%, calc(60% - ${containerHeight / 2}px) 100%`;

		// Text
		const containerChildCount = container.children.length;
		if (containerChildCount) {
			this.text = document.createElement('div');
			const colorClass = textColor ? textColor : 'white';
			this.text.classList.add('text-container', colorClass);

			// Text Position
			const bounded = 'max(var(--side-padding), calc((100vw - var(--max-width)) / 2))';
			const positionPresets = {
				'left': () => this.text.style.left = 'min(18%, var(--side-padding)',
				'left-bounded': () => this.text.style.left = bounded,
				'right': () => this.text.style.right = '18%',
				'right-bounded': () => this.text.style.right = `max(18%, ${bounded})`
			}
			// Replaces this.positionTextY (a otherwise empty function) with one that
			// vertically centers the text on resize
			const activateYPositioning = () => {
				this.positionTextY = () => {
					const centered = (this.totalHeight - this.text.clientHeight) / 2;
					this.text.style.top = `${centered}px`;
				}
			}
			// Default to preset: 'right'
			if (textPosition == undefined) {
				positionPresets.right();
				activateYPositioning();
			}
			// Execute preset off of provied string
			else if (typeof textPosition == 'string') {
				const preset = positionPresets[textPosition];
				if (preset) {
					preset();
					activateYPositioning();
				} else console.log(`LandingImage position preset (${textPosition}) doesn't exist`);
			// Add CSS properties and values off of provided object
			} else if (typeof textPosition == 'object') {
				for (const [property, text] of Object.entries(textPosition))
					this.text.style.setProperty(property, text);
			}

			let i = 0;
			do { // Move provided nodes from container to the text container
				const node = container.children[0];
				this.text.appendChild(container.removeChild(node));
				i++;
			} while (i < containerChildCount);

			this.revealedChildren = new Array(containerChildCount).fill(false);
			this.childOpacities = new Array(containerChildCount).fill(0);
			container.appendChild(this.text);
		}
		// Add to DOM
		this.fgLoaded = true;
		this.bgLoaded = true;

		if (fgFilepath) {
			this.fg = document.createElement('img');
			this.fg.src = fgFilepath;
			this.fg.className = 'landing-fg';

			this.fg.style.height = `calc(100% + ${this.totalDisplacement}px)`;
			if (this.doFgXDisp) {
				const amount = this.totalDisplacement * this.fgXDispFactor;
				this.fg.style.width = `calc(100% + ${amount}px)`;
			}

			this.fgLoaded = false;
			this.fg.onload = () => {
				this.fgLoaded = true;
				this.evaluateImageLoad();
			}
			container.appendChild(this.fg);
		}

		if (bgFilepath) {
			this.bg = document.createElement('img');
			this.bg.src = bgFilepath;

			this.bgLoaded = false;
			this.bg.onload = () => {
				this.bgLoaded = true;
				this.evaluateImageLoad();
			}
			container.appendChild(this.bg);
		}
		container.appendChild(this.overlay);

		this.tracker = new ScrollTracker(container);
		this.container = container;

		this.onResize();
	}

	initText() {
		if (!this.text) return;
		forEachElement(this.text.children, (child, index) => {
			setTimeout(() => {
				let opacity = 1;
				const currentOpacity = this.childOpacities[index];

				// If onScroll set an opacity already, reveal the element with that opacity, not 1
				if (currentOpacity) opacity = currentOpacity;
				else this.childOpacities[index] = opacity;

				child.style.opacity = opacity.toString();
				this.revealedChildren[index] = true;
				setTimeout(() => {
					child.style.transition = 'transform 0.3s ease-out, opacity 0.1s ease-out';
				}, 500);
			}, (index + 1) * 300);
		});
		this.onScroll(getScrollY());
	}

	evaluateImageLoad() {
		if (this.fgLoaded && this.bgLoaded) {
			this.initText();
			if (this.onload) this.onload();
		}
	}

	updateFg(t) {
		if (!this.fg) return;
		const displacementY = this.totalDisplacement * t * -1;
		if (this.doFgXDisp) {
			const displacementX = displacementY * this.fgXDispFactor;
			this.fg.style.transform = `translate(${displacementX}px, ${displacementY}px)`;
		} else this.fg.style.transform = `translateY(${displacementY}px)`;
	}

	updateBg(t) {
		if (!this.bg) return;
		const displacement = this.tracker.total * this.bgParallax * t;
		this.bg.style.transform = this.overlay.style.transform = `translateY(${displacement}px)`;
	}

	updateText(t, scrollY) {
		if (!this.text) return;
		const displacementY = this.tracker.total * this.textParallax * t;
		this.text.style.transform = `translateY(${displacementY}px)`;

		const doTextSlide = (child, index) => {
			if (!this.doTextSlide) return null;
			const scrollThreshold = this.textSlideOffset * index;
			const withinThreshold = scrollY >= scrollThreshold;
			const displacementX = Math.pow(scrollY - scrollThreshold, 2) * 0.001 * withinThreshold;
			child.style.transform = `translateX(-${displacementX}px)`;
			return displacementX;
		}

		const setOpacity = (child, index, opacity) => {
			const currentOpacity = this.childOpacities[index];
			if (opacity != currentOpacity) {
				this.childOpacities[index] = opacity;
				if (this.revealedChildren[index]) child.style.opacity = opacity.toString();
			}
		}

		forEachElement(this.text.children, (child, index) => {
			const displacementX = doTextSlide(child, index);
			if (this.textFadeFactor) {
				if (displacementX != null) { // Use horizontal displacement to determine opacity
					const end = this.totalWidth / this.textFadeFactor;
					const opacity = 1 - getBoundedTValue(0, displacementX, end);
					setOpacity(child, index, opacity);
				} else {
					const scrollThreshold = this.textSlideOffset * 2 * (index + 1);
					const distanceFromThreshold = scrollY - scrollThreshold;
					if (distanceFromThreshold < 0) { // Wait to start fading
						setOpacity(child, index, 1);
						return;
					}
					const end = 400 - 25 * this.textFadeFactor;
					const opacity = 1 - getBoundedTValue(0, distanceFromThreshold, end);
					setOpacity(child, index, opacity);
				}
			}
		});
	}

	onScroll(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		if (!this.tracker.changed) return;

		const t = this.tracker.t;
		const displacement = this.totalDisplacement * t;

		this.updateFg(t);
		this.updateBg(t);
		this.updateText(t, scrollY);
	}

	positionTextY() {
		if (!this.text) return;
	}
	
	onResize() {
		this.tracker.onResize();
		this.totalHeight = this.container.clientHeight;
		this.totalWidth = this.container.clientWidth;
		this.positionTextY();
	}
}

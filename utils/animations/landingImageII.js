import { getBoundedTValue, ScrollTracker } from '../animations.js';
import { forEachElement, getHeaderHeight, getScrollY, getVPH } from '../elements.js';

/* LandingImageII

	landingImageData:
	- container: [DOM element] container the landing image generates in
	- fgFilepath: [string] (url) foreground image filepath
	- bgFilepath: [string] (url) background image filepath
	- textPosition: ['left', 'right', 'custom'] custom allows positioning via external css (default right)
	- textColor: [string] color className (default inherit)
	- textFade: ['slow', 'medium', 'fast', 'none'] how quickly the text fades out (default slow)
	- textSlide: [boolean] whether the text slides left (default true)
	- height: [number] (px) height of container (default viewport height)
	- minHeight: [number] (px) minimum size to default to
	- maxHeight: [number] (px) maximum size to default to
	- doHorizontalFgDisp: [bool] whether to move the fg sideways too (default true)
*/
export class LandingImageII {
	constructor(landingImageData) {
		const {
			container, // DOM element
			fgFilepath, // filepath url
			bgFilepath, // filepath url
			textPosition, // left, right, custom
			textColor, // color className
			textFade, // slow, medium, fast, off
			textSlide, // boolean
			height, // px
			minHeight, // px
			maxHeight, // px
			doHorizontalFgDisp // boolean
		} = landingImageData;

		// Initial values
		this.totalDisplacement = 100; // px
		// this.fgXDispFactor = 0.67; // proportion of horizontal fg displacement

		// From landingImageData
		this.doFgXDisp = doHorizontalFgDisp != undefined ? doHorizontalFgDisp : true;
		this.bgParallax = 1;
		this.textPos = textPosition != undefined ? textPosition : 'right';
		this.textColor = textColor != undefined ? textColor : 'white';

		container.className = 'landing-image';
		container.style.setProperty('--total', this.totalDisplacement + 'px');
		container.style.setProperty('--t', '0');

		// Set container height
		let containerHeight;
		if (height) containerHeight = height;
		else {
			containerHeight = getVPH();
			if (minHeight) containerHeight = Math.max(containerHeight, minHeight);
			if (maxHeight) containerHeight = Math.min(containerHeight, maxHeight);
		}
		// container.style.height = containerHeight.toString() + 'px';
		container.style.setProperty('--height', `${containerHeight}px`);

		// Clip path overlay
		this.overlay = document.createElement('div');
		this.overlay.classList.add('landing-bg-overlay', 'background');
		this.overlay.style.clipPath =
			`polygon(60% 0, 100% 0, 100% 100%, calc(60% - ${containerHeight / 2}px) 100%`;

		// Text
		const containerChildCount = container.children.length;
		if (containerChildCount) {
			this.text = document.createElement('div');
			const colorClass = textColor ? textColor : 'white';
			this.text.classList.add('text-container', colorClass);

			let i = 0;
			while (i < containerChildCount) {
				const node = container.children[0];
				this.text.appendChild(container.removeChild(node));
				i++;
			}
			container.appendChild(this.text);

		}
		// Add to DOM
		this.fgLoaded = true;
		this.bgLoaded = true;

		if (fgFilepath) {
			this.fg = document.createElement('img');
			this.fg.src = fgFilepath;
			this.fg.className = 'landing-fg';

			const doFgXDisp = doHorizontalFgDisp != undefined ? doHorizontalFgDisp : true;
			const xDispFactor = doFgXDisp * 0.67;
			this.fg.style.setProperty('--x-disp-factor', xDispFactor);

			this.fg.style.height = `calc(100% + ${this.totalDisplacement}px)`;
			if (this.doFgXDisp) {
				const xDispFactor = 0.67;
				this.fg.style.setProperty('--x-disp-factor', xDispFactor);
				const amount = this.totalDisplacement * xDispFactor;
				this.fg.style.width = `calc(100% + ${amount}px)`;
			}

			this.fgLoaded = false;
			this.fg.onload = () => {
				this.fgLoaded = true;
				this.evalImageLoad();
			}
			container.appendChild(this.fg);
		}

		if (bgFilepath) {
			this.bg = document.createElement('img');
			this.bg.src = bgFilepath;
			this.bg.className = 'background';

			this.bgLoaded = false;
			this.bg.onload = () => {
				this.bgLoaded = true;
				this.evalImageLoad();
			}
			container.appendChild(this.bg);
		}
		container.appendChild(this.overlay);

		this.tracker = new ScrollTracker(container);
		this.container = container;

		this.onResize();
	}

	initText() {
	}

	evalImageLoad() {
		if (this.fgLoaded && this.bgLoaded) {
			this.initText();
			if (this.onload) this.onload();
		}
	}

	onScroll(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		if (!this.tracker.changed) return;
		this.container.style.setProperty('--t', this.tracker.t.toString());
		this.container.style.setProperty('--scroll', this.tracker.distance.toString());
	}

	positionText() {
		const getTop = () => (this.totalHeight - this.text.clientHeight) / 2;
		switch (this.textPos) {
			case 'custom': break;
			case 'left':
				this.text.style.left = 'var(--side-padding)';
				this.text.style.top = getTop() + 'px';
				break;
			case 'right':
				this.text.style.right = '18%';
				this.text.style.top = getTop() + 'px';
				break;
		}
	}
	
	onResize() {
		this.totalHeight = this.container.clientHeight;
		this.totalWidth = this.container.clientWidth;
		this.container.style.setProperty('--scroll-height', `${this.totalHeight - getHeaderHeight()}px`);
		this.positionText();
	}
}

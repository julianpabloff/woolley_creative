import { getBoundedTValue, ScrollTracker } from '../animations.js';
import { forEachElement, getScrollY, getVPH } from '../elements.js';

export class LandingImage {
	constructor(landingImageData) {
		const {
			container, // DOM element
			fgFilepath, // image filepath
			bgFilepath, // image filepath
			heroText, // array of words
			heroTextY, // Between 0 and 1 (default .5)
			heroTextColor, // color className (default inherit)
			height, // px (default viewport height in pixels)
			minHeight, // px (minimum size to default to)
			maxHeight, // px (maximum size to default to)
			initFgDisp, // px (default 100)
			doHorizontalFgDisp, // bool (default true)
			opacitySpeed // multiplier (default 4)
		} = landingImageData;

		container.className = "landing-container";

		// Set container height
		let containerHeight;
		if (height) containerHeight = height;
		else {
			containerHeight = getVPH();
			if (minHeight) containerHeight = Math.max(containerHeight, minHeight);
			if (maxHeight) containerHeight = Math.min(containerHeight, maxHeight);
		}
		container.style.height = containerHeight.toString() + 'px';

		this.overlay = document.createElement('div');
		this.overlay.className = 'landing-bg-overlay';

		// Initial values
		this.initFgDisp = initFgDisp != undefined ? initFgDisp : 100;
		this.fgDispAmount = 100;
		this.doHorizontalFgDisp = doHorizontalFgDisp != undefined ? doHorizontalFgDisp : true;
		this.bgParallax = 0.3; // multiplier
		this.heroInitY = heroTextY != undefined ? heroTextY : 0.5; // between 0 and 1
		this.heroTextOffset = 75; // px
		this.heroFadeInOffset = 300; // ms
		this.heroVelocity = 0.0010; // multiplier
		this.heroOpacityFactor = opacitySpeed != undefined ? opacitySpeed : 4 // multiplier
		this.accountForHeader = true;

		// Add to DOM
		if (heroText) {
			this.heroText = document.createElement('div');
			const colorClass = heroTextColor != undefined ? heroTextColor : 'white';
			this.heroText.className = 'hero-text ' + colorClass;
			for (const text of heroText) {
				const h1 = document.createElement('h1');
				h1.innerText = text;
				this.heroText.appendChild(h1);
			}
			this.revealedH1s = []; // Wait to set opacity on scroll until init()
			container.appendChild(this.heroText);
		}

		this.fgLoaded = true;
		this.bgLoaded = true;

		if (fgFilepath) {
			this.fg = document.createElement('img');
			this.fg.src = fgFilepath;
			this.fg.className = 'landing-fg';

			const fgHeightAdd = this.fgDispAmount - this.initFgDisp;
			this.fg.style.height = `calc(100% + ${fgHeightAdd}px)`;
			if (this.doHorizontalFgDisp) this.fg.style.width = `calc(100% + ${this.fgDispAmount / 1.5}px)`;

			this.fgLoaded = false;
			this.fg.onload = () => { this.fgLoaded = true; this.evalImageLoad(); };
			container.appendChild(this.fg);
		}

		if (bgFilepath) {
			this.bg = document.createElement('img');
			this.bg.src = bgFilepath;

			this.bgLoaded = false;
			this.bg.onload = () => { this.bgLoaded = true; this.evalImageLoad(); };
			container.appendChild(this.bg);
		}
		container.appendChild(this.overlay);

		this.tracker = new ScrollTracker(container);

		this.onResize();
		this.setFgDisp(0);
		this.setBgDisp(0);
	}

	setFgDisp(displacement) {
		if (this.fg) {
			this.fg.style.top = `${this.initFgDisp - displacement}px`;
			if (this.doHorizontalFgDisp) this.fg.style.left = `-${displacement / 1.5}px`;
		}
	}

	setBgDisp(displacement) {
		if (this.heroText) {
			this.heroY = this.initHeroDisp + displacement;
			this.heroText.style.transform = `translateY(${displacement}px)`;
			this.bgDisp = displacement;
		}
		if (this.bg) this.bg.style.top = this.overlay.style.top = `${displacement * 2}px`;
	}

	init() {
		if (this.heroText) {
			forEachElement(this.heroText.children, (h1, index) => {
				this.revealedH1s.push(false);
				setTimeout(() => {
					h1.style.opacity = '1';
					setTimeout(() => this.revealedH1s[index] = true, 500);
				}, (index + 1) * this.heroFadeInOffset);
			});
			this.onScroll(getScrollY());
		}
	}

	evalImageLoad() {
		if (this.fgLoaded && this.bgLoaded) {
			this.init();
			if (this.onload) this.onload();
		}
	}

	onScroll(scrollY = window.scrollY) {
		this.tracker.onScroll(scrollY);
		if (!this.tracker.changed) return;
		const t = this.tracker.t;

		this.setFgDisp(this.fgDispAmount * t);
		this.setBgDisp(this.totalHeight * t * this.bgParallax);
		this.overlay.style.opacity = (1 - t).toString();

		if (this.heroText) {
			forEachElement(this.heroText.children, (h1, index) => {
				const threshold = index * this.heroTextOffset;
				const displacement = Math.pow(scrollY - threshold, 2) * this.heroVelocity;

				h1.style.right = (displacement * (
					scrollY >= threshold && // delay until offset factor reached
					scrollY < this.totalHeight && // stop after scroll passes landing
					displacement < this.heroLeft + this.heroWidth // stop after text reaches left side
				)).toString() + 'px';

				if (this.revealedH1s[index] && scrollY >= threshold) // only apply opacity if revealed
					h1.style.opacity = 1 - displacement / (this.totalWidth / this.heroOpacityFactor);
					// h1.style.opacity = 1 - displacement / (window.innerWidth / this.heroOpacityFactor);
			});
		}
	}

	onResize() {
		// this.headerHeight = this.accountForHeader ? document.getElementById('header').clientHeight : 0;
		const reference = this.bg ? this.bg : this.fg;
		this.totalHeight = reference.clientHeight;
		this.totalWidth = reference.clientWidth;
		if (this.heroText) {
			this.initHeroDisp = this.heroInitY * (this.totalHeight - this.heroText.clientHeight);
			this.heroText.style.top = this.initHeroDisp.toString() + 'px';
			this.heroY = this.initHeroDisp + this.bgDisp;
			this.heroLeft = this.heroText.offsetLeft;
			this.heroWidth = this.heroText.clientWidth;
		}
	}
}

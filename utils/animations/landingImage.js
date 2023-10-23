import { forEachElement } from '../elements.js';

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
			this.fg.style.height = `calc(100% + ${fgHeightAdd}px)`;
			this.fg.style.width = `calc(100% + ${(fgHeightAdd / 1.5)}px)`;
			container.appendChild(this.fg);
		}
		container.appendChild(this.bg);
		container.appendChild(this.overlay);

		this.onResize();
		this.setFgDisp(0);
		this.setBgDisp(0);
	}

	setFgDisp(displacement) {
		if (this.fg) {
			this.fg.style.top = (this.initFgDisp - displacement) + 'px';
			this.fg.style.left = `-${(displacement / 1.5)}px`;
		}
	}

	setBgDisp(displacement) {
		this.bgDisp = displacement;
		this.heroY = this.initHeroDisp + displacement;
		this.heroText.style.transform = `translateY(${displacement}px)`;
		this.bg.style.top = this.overlay.style.top = (displacement * 2) + 'px';
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

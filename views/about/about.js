import { getBoundedTValue, LandingImage, ScrollFadeInElement } from '../../utils/animations.js';
import { forEachElement, getAbsoluteOffset } from '../../utils/elements.js';

export default function About() {
	// Get DOM elements
	const landingContainer = document.getElementById('about-landing');
	const landingText = document.getElementById('about-landing-text');
	const aboutBg = document.getElementById('about-bw-1');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/about/landing_image_foreground.webp',
		bgFilepath: '/assets/about/landing_image_background.jpg',
		heroText: ['Hey,', 'We\'re', 'Woolley.'],
		// height: 'min(100vh, 960px)',
		initFgDisp: 0,
		heroTextY: 0.25,
		opacitySpeed: 16
	});

	function setLandingTextY() {
		const landingTextY = landingImage.heroY + landingImage.heroText.clientHeight + 40;
		landingText.style.top = landingTextY.toString() + 'px';
	}

	function initLanding() {
		landingImage.init();
		setLandingTextY();
		setTimeout(() => landingText.style.opacity = '1', landingImage.heroFadeInOffset * 4);
	}

	// Initialize landingImage heroText on image load
	let landingFgLoaded = false;
	let landingBgLoaded = false;
	const assessImageLoad = () => { if (landingFgLoaded && landingBgLoaded) initLanding() };
	landingImage.fg.onload = () => {
		landingFgLoaded = true;
		assessImageLoad();
	}
	landingImage.bg.onload = () => {
		landingBgLoaded = true;
		assessImageLoad();
	}

	let aboutFadeIn;
	aboutBg.onload = () => {
		aboutFadeIn = new ScrollFadeInElement(aboutBg, {
			inPadding: 300,
			threshold: 0.4,
			maxOpacity: 0.5
		});
		aboutFadeIn.onScroll(window.scrollY);
	};

	function onScroll() {
		const scrollY = window.scrollY;
		landingImage.onScroll(scrollY);

		// Landing Text animation
		forEachElement(landingText.children, (p, index) => {
			const threshold = 3.3 * landingImage.heroTextOffset;
			const displacement = Math.pow(scrollY - threshold, 2) * landingImage.heroVelocity;

			p.style.right = (displacement * (
				scrollY >= threshold &&
				scrollY < landingImage.landingHeight &&
				displacement < landingImage.heroLeft + window.innerWidth
			)).toString() + 'px';

			if (landingImage.revealedH1s[2] && scrollY >= threshold)
				p.style.opacity = 1 - displacement / (window.innerWidth / 20);
		});

		setLandingTextY();
		if(aboutFadeIn) aboutFadeIn.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
		setLandingTextY();
	}

	return { onScroll, onResize };
}

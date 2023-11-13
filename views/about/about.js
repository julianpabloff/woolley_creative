import {
	getBoundedTValue,
	LandingImage,
	ScrollFadeInElement,
	SlideList
} from '../../utils/animations.js';
import { forEachElement } from '../../utils/elements.js';

export default function About() {
	// Get DOM elements
	const landingContainer = document.getElementById('about-landing');
	const landingText = document.getElementById('about-landing-text');
	const slideListContainer = document.getElementById('slide-list');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/about/landing_image_foreground.webp',
		bgFilepath: '/assets/about/landing_image_background.jpg',
		heroText: ['Hey,', 'We\'re', 'Woolley.'],
		// height: 'min(100vh, 960px)',
		heroTextY: 0.25,
		initFgDisp: 0,
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

	const slideListItems = [
		'is committed to doing good.',
		'doesn’t have all the answers.',
		'walks the talk.',
		'is up for a challenge.',
		'is all about community and collaboration.',
		'thinks this stuff is fun.',
		'asks an absurd amount of questions.',
	];
	const slideList = new SlideList(slideListContainer, slideListItems);
	slideList.start();

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
	}

	function onResize() {
		landingImage.onResize();
		setLandingTextY();
	}

	function onDestroy() {
		slideList.stop();
	}

	return { onScroll, onResize, onDestroy };
}

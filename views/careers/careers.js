import { getBoundedTValue, LandingImage } from '../../utils/animations.js';

export default function Careers() {
	// Get DOM elements
	const landingContainer = document.getElementById('careers-landing');
	const landingText = document.getElementById('careers-landing-text');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/careers/landing_image_foreground.webp',
		height: 'min(100vh, 900px)',
		doHorizontalFgDisp: false
	});

	function onScroll() {
		const scrollY = window.scrollY;
		const scrollEnd = landingImage.landingHeight - landingImage.headerHeight;
		const scrollT = getBoundedTValue(0, scrollY, scrollEnd);

		const displacement = landingImage.landingHeight / 2 * scrollT;
		landingText.style.transform = `translateY(${displacement}px)`;

		landingImage.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
	}

	return { onScroll, onResize };
}

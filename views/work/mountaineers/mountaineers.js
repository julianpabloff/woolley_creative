import { LandingImage, ScrollFadeOut } from '../../../utils/animations.js';
import { bounded, getScrollY } from '../../../utils/elements.js';

export default function Mountaineers() {
	// Get DOM elements
	const landingContainer = document.getElementById('mountaineers-landing');
	const location = document.getElementById('mountaineers-location');

	const landingImage = new LandingImage({
		container: landingContainer,
		bgFilepath: '/assets/work/mountaineers/landing_image_background.jpg',
		maxHeight: 900,
		textPosition: {
			bottom: '80px',
			right: bounded
		},
		textFade: 'fast',
		textSlide: false
	});

	const locationFade = new ScrollFadeOut(location, { outPadding: 150 });

	function onScroll() {
		const scrollY = getScrollY();

		landingImage.onScroll(scrollY);
		locationFade.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
		locationFade.onResize();
	}

	return { onScroll, onResize }
}

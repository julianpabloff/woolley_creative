import { LandingImage } from '../../utils/animations.js';

export default function Work() {
	const landingContainer = document.getElementById('work-landing');

	const landingImage = new LandingImage({
		container: landingContainer,
		bgFilepath: '/assets/work/landing_image_background.webp',
		heroText: ['We', 'Do', 'Creative.'],
		height: 'min(100vh, 900px)'
	});

	// Initialize landingImage heroText on image load
	landingImage.bg.onload = () => landingImage.init();

	function onScroll() {
		const scrollY = window.scrollY;
		landingImage.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
	}

	return { onScroll, onResize };
}

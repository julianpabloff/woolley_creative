import { LandingImage } from '../../utils/animations.js';

export default function Work() {
	const landingContainer = document.getElementById('work-landing');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/home/landing_image_foreground.webp',
		bgFilepath: '/assets/home/landing_image_background.webp',
		heroText: ['We', 'Create', 'Outside.']
	});

	// Custom positioning for home foreground image
	landingImage.fg.style.objectPosition = '70% center';

	setTimeout(() => {
		landingImage.init();
		console.log('foreground loaded');
	}, 750);

	function onScroll() {
		const scrollY = window.scrollY;
		landingImage.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
	}

	return { onScroll, onResize };
}

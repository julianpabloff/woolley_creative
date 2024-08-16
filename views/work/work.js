import { ImageZoom, LandingImage } from '../../utils/animations.js';

export default function Work() {
	// Get DOM elements
	const landingContainer = document.getElementById('work-landing');
	const projectsContainer = document.getElementById('work-projects');
	const images = document.getElementsByClassName('image');

	const landingImage = new LandingImage({
		container: landingContainer,
		bgFilepath: '/assets/work/landing_image_background.webp',
		maxHeight: 900,
		textSlide: false
	});

	const zooms = [];
	for (const image of images) {
		zooms.push(new ImageZoom(image));
	}

	function onScroll() {
		const scrollY = window.scrollY;
		landingImage.onScroll(scrollY);
		zooms.forEach(zoom => zoom.onScroll(scrollY));
	}

	function onResize() {
		landingImage.onResize();
		thing.onResize();
	}

	return { onScroll, onResize };
}

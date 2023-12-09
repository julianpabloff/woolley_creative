import { getBoundedTValue, LandingImage, SlideList } from '../../utils/animations.js';
import { forEachElement } from '../../utils/elements.js';

export default function About() {
	// Get DOM elements
	const landingContainer = document.getElementById('about-landing');
	const slideListContainer = document.getElementById('slide-list');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/about/landing_image_foreground.webp',
		bgFilepath: '/assets/about/landing_image_background.jpg',
		minHeight: 960,
		textPosition: 'custom',
		textColor: 'blue',
		textFade: 'fast'
	});

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
	}

	function onResize() {
		landingImage.onResize();
	}

	function onDestroy() {
		slideList.stop();
	}

	return { onScroll, onResize, onDestroy };
}

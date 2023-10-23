import { forEachElement } from '../../utils/elements.js';
import {
	LandingImage,
	ScrollFadeInGroup,
	SlideoutObserver,
	SpriteSheetScroll
} from '../../utils/animations.js';

export default function Home() {
	// Get DOM elements
	const landingContainer = document.getElementById('home-landing');
	const categories = document.getElementById('categories-section');
	const showcaseContainer = document.getElementById('showcase-container');
	const partners = document.getElementById('partner-links');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/home/landing_image_foreground.webp',
		bgFilepath: '/assets/home/landing_image_background.webp',
		heroText: ['We', 'Create', 'Outside.']
	});

	// Custom positioning for home foreground image
	landingImage.fg.style.objectPosition = '70% center';

	// Initialize landingImage heroText on image load
	let landingFgLoaded = false;
	let landingBgLoaded = false;
	const assessImageLoad = () => { if (landingFgLoaded && landingBgLoaded) landingImage.init() };
	landingImage.fg.onload = () => {
		landingFgLoaded = true;
		assessImageLoad();
	}
	landingImage.bg.onload = () => {
		landingBgLoaded = true;
		assessImageLoad();
	}

	// Scroll fade in elements
	const categoryScrollFade = new ScrollFadeInGroup(90, 100, 0.2);
	forEachElement(categories.children, category => categoryScrollFade.addElement(category));

	// 5D Spinning on scroll
	const cameraSpin = new SpriteSheetScroll({
		container: document.getElementById('camera-spin-container'),
		filepath: '/assets/home/360_spritesheet.webp',
		columns: 8,
		count: 21,
		imgWidth: 810,
		imgHeight: 780
	});

	// Work showcase
	const showcases = [
		{ text: 'Studio Product', path: '/assets/home/work_01.jpg', double: false },
		{ text: 'Environmental Photography', path: '/assets/home/work_02.jpg', double: false },
		{ text: 'Brand Guidelines', path: '/assets/home/work_03.jpg', double: false },
		{ text: 'Website Design', path: '/assets/home/work_04.jpg', double: false },
		{ text: 'Location Product', path: '/assets/home/work_05.jpg', double: false },
		{ text: 'Lifestyle Photography', path: '/assets/home/work_06.jpg', double: true },
		{ text: 'Studio On-Figure', path: '/assets/home/work_07.jpg', double: true },
		{ text: 'Drone', path: '/assets/home/work_08.jpg', double: false },
		{ text: 'Industry Events', path: '/assets/home/work_09.jpg', double: false },
		{ text: 'Product', path: '/assets/home/work_10.jpg', double: true },
		{ text: 'Social Media Assets', path: '/assets/home/work_11.jpg', double: false },
	]

	const showcaseSlidout = new SlideoutObserver();

	showcases.forEach(({ text, path, double }) => {
		const image = document.createElement('img');
		image.src = path;
		image.alt = text;

		const span = document.createElement('span');
		span.innerText = text;
		const h6 = document.createElement('h6');
		h6.appendChild(span);

		const showcase = document.createElement('div');
		if (double) showcase.classList.add('double');

		image.onload = () => showcaseSlidout.add(showcase);

		showcase.append(image, h6);
		showcaseContainer.appendChild(showcase);
	});

	// Events
	function onScroll() {
		landingImage.onScroll(scrollY);
		categoryScrollFade.onScroll(scrollY);
		cameraSpin.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
		categoryScrollFade.toggleOffset(window.innerWidth > 767);
		cameraSpin.onResize();
		onScroll();
	}

	onResize();

	return { onScroll, onResize };
}

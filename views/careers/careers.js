import { getBoundedTValue, LandingImage } from '../../utils/animations.js';

export default function Careers(onReady) {
	// Get DOM elements
	const landingContainer = document.getElementById('careers-landing');
	const landingText = document.getElementById('careers-landing-text');
	const namesake = document.getElementById('namesake');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/careers/landing_image_foreground.webp',
		height: 'min(100vh, 900px)',
		doHorizontalFgDisp: false
	});

	landingImage.fg.onload = () => {
		namesake.style.opacity = '1';
		setTimeout(() => landingText.style.opacity = '1', landingImage.heroFadeInOffset);
	}

	addEventListener('load', event => { console.log(event) });

	// When namesake should fade out to 0
	let namesakeEnd;
	function calcNamesakeEnd() {
		const width = window.innerWidth;
		if (width > 1024) { namesakeEnd = 150; return; }
		if (width > 767) { namesakeEnd = 100; return; }
		namesakeEnd = 50;
	}
	calcNamesakeEnd();

	const bannerDisp = 150;

	function onScroll() {
		const scrollY = window.scrollY;

		landingImage.onScroll(scrollY);
		const displacement = landingImage.landingHeight / 2 * landingImage.tracker.t;
		landingText.style.transform = `translateY(${displacement}px)`;

		const namesakeT = getBoundedTValue(0, scrollY, namesakeEnd);
		namesake.style.opacity = 1 - namesakeT;
	}

	function onResize() {
		landingImage.onResize();
		calcNamesakeEnd();
	}

	return { onScroll, onResize };
}

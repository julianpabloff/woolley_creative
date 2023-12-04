import { getBoundedTValue, LandingImage, ScrollFadeOut } from '../../utils/animations.js';

export default function Careers(onReady) {
	// Get DOM elements
	const landingContainer = document.getElementById('careers-landing');
	const landingText = document.getElementById('careers-landing-text');
	const namesake = document.getElementById('namesake');
	const shoulder = document.getElementById('woolley-shoulder');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/careers/landing_image_foreground_crop.png',
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
		if (width > 1024) return 150;
		if (width > 767) return 100;
		return 50;
	}
	namesakeEnd = calcNamesakeEnd();

	const shoulderFadeOut = new ScrollFadeOut(shoulder);

	function onScroll() {
		const scrollY = window.scrollY;

		landingImage.onScroll(scrollY);
		if (landingImage.tracker.visible) {
			const displacement = landingImage.landingHeight / 2 * landingImage.tracker.t;
			landingText.style.transform = `translateY(${displacement}px)`;
		}

		const namesakeT = getBoundedTValue(0, scrollY, namesakeEnd);
		namesake.style.opacity = 1 - namesakeT;

		shoulderFadeOut.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
		namesakeEnd = calcNamesakeEnd();
		shoulderFadeOut.onResize();
	}

	return { onScroll, onResize };
}

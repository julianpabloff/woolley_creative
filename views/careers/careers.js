import { getBoundedTValue, LandingImage, ScrollFadeOut } from '../../utils/animations.js';
import { getScrollY } from '../../utils/elements.js';

export default function Careers(onReady) {
	// Get DOM elements
	const landingContainer = document.getElementById('careers-landing');
	const namesake = document.getElementById('namesake');

	const landingImage = new LandingImage({
		container: landingContainer,
		fgFilepath: '/assets/careers/landing_image_foreground_crop.png',
		maxHeight: 900,
		textPosition: 'left-bounded',
		textFade: 'none',
		textSlide: false,
		doHorizontalFgDisp: false
	});

	landingImage.onload = () => {
		setTimeout(() => {
			namesake.style.opacity = '1';
			setTimeout(() => namesake.style.transition = 'opacity 0.1s ease-out', 10);
		}, 500);
	}

	// When namesake should fade out to 0
	let namesakeEnd;
	function calcNamesakeEnd() {
		const width = landingImage.totalWidth;
		if (width > 1024) return 150;
		if (width > 767) return 100;
		return 50;
	}
	namesakeEnd = calcNamesakeEnd();

	let prevNamesakeT;
	function onScroll() {
		const scrollY = getScrollY();

		landingImage.onScroll(scrollY);

		const namesakeT = getBoundedTValue(0, scrollY, namesakeEnd);
		if (namesakeT != prevNamesakeT) namesake.style.opacity = 1 - namesakeT;
		prevNamesakeT = namesakeT;
	}

	function onResize() {
		landingImage.onResize();
		namesakeEnd = calcNamesakeEnd();
	}

	return { onScroll, onResize };
}

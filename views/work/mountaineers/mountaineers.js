import { ImageGrid, LandingImage, ScrollFadeOut } from '../../../utils/animations.js';
import { bounded, getScrollY } from '../../../utils/elements.js';

export default function Mountaineers() {
	// Get DOM elements
	const landingContainer = document.getElementById('mountaineers-landing');
	const location = document.getElementById('mountaineers-location');
	const sampleContainer = document.getElementById('mountaineers-samples');

	const landingImage = new LandingImage({
		container: landingContainer,
		bgFilepath: '/assets/work/mountaineers/landing_image_background.jpg',
		maxHeight: 700,
		textPosition: {
			bottom: '80px',
			right: bounded
		},
		textFade: 'fast',
		textSlide: false
	});

	const locationFade = new ScrollFadeOut(location, { outPadding: 150 });

	const sampleImages = [
		[{ src: '/assets/work/mountaineers/sample_1.jpg', width: 2333, height: 1562 }],
		[{ src: '/assets/work/mountaineers/sample_2.jpg', width: 2333, height: 937 }],
		[
			{ src: '/assets/work/mountaineers/sample_3.jpg', width: 771, height: 1042 },
			{ src: '/assets/work/mountaineers/sample_4.jpg', width: 1521, height: 1042 }
		],
		[{ src: '/assets/work/mountaineers/sample_5.jpg', width: 2333, height: 1562 }]
	];
	const samples = new ImageGrid(sampleContainer, sampleImages);

	function onScroll() {
		const scrollY = getScrollY();

		landingImage.onScroll(scrollY);
		locationFade.onScroll(scrollY);
		samples.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
		locationFade.onResize();
		samples.onResize();
	}

	return { onScroll, onResize }
}

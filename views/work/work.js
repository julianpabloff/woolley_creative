import { getAbsoluteX, getScrollY } from '../../utils/elements.js';
import { ImageZoom, LandingImage, ScrollTracker } from '../../utils/animations.js';

class ImageSlideout {
	constructor(container) {
		const imgsInContainer = container.getElementsByTagName('IMG');
		if (!imgsInContainer.length) return;
		this.image = imgsInContainer[0];
		this.container = container;
		this.amount = 50;
		this.enabled = false;

		this.tracker = new ScrollTracker(container);
		this.onResize();
	}

	translateImageX(x) {
		this.container.style.transform = `translateX(${x}px)`;
	}

	onScroll(scrollY = getScrollY()) {
		if (!this.enabled) return;
		this.tracker.onScroll(scrollY);
		const x = this.displacement * (1 - this.tracker.t);
		this.translateImageX(x);
	}

	onResize() {
		const windowWidth = window.innerWidth;
		if (windowWidth <= 900) {
			this.translateImageX(0);
			this.displacement = 0;
			this.enabled = false;
			return;
		}

		const imageCenterX = getAbsoluteX(this.image) + this.image.clientWidth / 2;
		const screenCenter = windowWidth / 2;

		if (imageCenterX <= screenCenter) this.displacement = 0 - this.amount;
		else this.displacement = this.amount;
		this.enabled = true;

		this.tracker.onResize();
		this.onScroll();
	}
}

export default function Work() {
	// Get DOM elements
	const landingContainer = document.getElementById('work-landing');
	const projectsContainer = document.getElementById('work-projects');
	const imageContainers = document.getElementsByClassName('image');

	const slowButton = document.getElementById('slow');
	const mediumButton = document.getElementById('medium');
	const fastButton = document.getElementById('fast');

	const landingImage = new LandingImage({
		container: landingContainer,
		bgFilepath: '/assets/work/landing_image_background.webp',
		maxHeight: 900,
		textSlide: false
	});

	const slideouts = [];
	for (const container of imageContainers)
		slideouts.push(new ImageSlideout(container));

	function updateSlideoutSpeed(amount) {
		slideouts.forEach(slideout => {
			slideout.amount = amount;
			slideout.onResize();
		});
	}
	slowButton.onclick = () => updateSlideoutSpeed(20);
	mediumButton.onclick = () => updateSlideoutSpeed(50);
	fastButton.onclick = () => updateSlideoutSpeed(85);

	function onScroll() {
		const scrollY = window.scrollY;
		landingImage.onScroll(scrollY);
		slideouts.forEach(slideout => slideout.onScroll(scrollY));
	}

	function onResize() {
		landingImage.onResize();
		slideouts.forEach(slideout => slideout.onResize());
	}

	return { onScroll, onResize };
}

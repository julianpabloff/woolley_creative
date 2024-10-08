import { getAbsoluteX, getScrollY, getVPW } from '../../utils/elements.js';
import { ImageZoom, LandingImage, ScrollTracker } from '../../utils/animations.js';

class WorkImageAnimation {
	constructor(container) {
		const imgsInContainer = container.getElementsByTagName('IMG');
		if (!imgsInContainer.length) return;
		this.image = imgsInContainer[0];
		this.container = container;
		this.amount = 30;
		this.zoomAmount = 0.15;

		this.tracker = new ScrollTracker(container);
		this.onResize();
	}

	translateImageX(x) {
		this.container.style.transform = `translateX(${x}px)`;
	}

	scaleImage(scale) {
		this.image.style.transform = `scale(${scale})`;
	}

	onScrollLarge(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		const x = this.displacement * (1 - this.tracker.t);
		this.translateImageX(x);
	}

	onScrollSmall(scrollY = getScrollY()) {
		this.tracker.onScroll(scrollY);
		const scale = 1 + this.zoomAmount * (1 - this.tracker.t);
		this.scaleImage(scale);
	}

	onResize() {
		const windowWidth = window.innerWidth;
		if (windowWidth <= 900) {
			this.translateImageX(0);
			this.onScroll = (scrollY = getScrollY()) => this.onScrollSmall(scrollY);
		} else {
			this.scaleImage(1);

			const imageCenterX = getAbsoluteX(this.image) + this.image.clientWidth / 2;
			const screenCenter = windowWidth / 2;

			if (imageCenterX <= screenCenter) this.displacement = 0 - this.amount;
			else this.displacement = this.amount;

			this.onScroll = (scrollY = getScrollY()) => this.onScrollLarge(scrollY);
		}
		this.tracker.onResize();
		this.onScroll();
	}
}

export default function Work() {
	// Get DOM elements
	const landingContainer = document.getElementById('work-landing');
	const projectsContainer = document.getElementById('work-projects');
	const imageContainers = document.getElementsByClassName('image');

	const landingImage = new LandingImage({
		container: landingContainer,
		bgFilepath: '/assets/work/landing_image_background.webp',
		maxHeight: 900,
		textFade: 'medium',
		textSlide: 'right',
		textPosition: 'right-bounded'
	});

	const animations = [];
	for (const container of imageContainers)
		animations.push(new WorkImageAnimation(container));

	function onScroll() {
		const scrollY = window.scrollY;
		landingImage.onScroll(scrollY);
		animations.forEach(slideout => slideout.onScroll(scrollY));
	}

	let prevVPW = 0;
	function onResize() {
		landingImage.onResize();
		animations.forEach(slideout => slideout.onResize());
	}

	return { onScroll, onResize };
}

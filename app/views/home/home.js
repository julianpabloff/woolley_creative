import { forEachElement } from '../../utils/elements.js';
import { ScrollFadeInGroup, SlideoutObserver, SpriteSheetScroll, Trapezoid } from '../../utils/animations.js';

export default function Home() {
	// Get DOM elements
	const header = document.getElementById('header');
	const landingFg = document.getElementById('landing-fg');
	const landingBg = document.getElementById('landing-bg');
	const clipPathOverlay = document.getElementById('landing-bg-overlay');
	const mottoContainer = document.getElementById('motto-container');
	const categories = document.getElementById('categories-section');
	const showcaseContainer = document.getElementById('showcase-container');
	const partners = document.getElementById('partner-links');

	// DOM element dimensions
	function setSize() {
		windowWidth = window.innerWidth;
		headerHeight = header.clientHeight;
		landingHeight = landingFg.clientHeight;
		initMottoDispY = landingHeight / 2 - mottoContainer.clientHeight / 2;
		mottoLeft = mottoContainer.offsetLeft;
		mottoWidth = mottoContainer.clientWidth;
	}
	let windowWidth, headerHeight, landingHeight, initMottoDispY, mottoLeft, mottoWidth;

	// Initial values
	const initFgDisp = 100; // px
	const bgParallax = 0.3; // multiplier
	const mottoOffset = 75; // px
	const mottoFadeInOffset = 300; // ms
	const mottoVelocity = 0.0010; // multiplier

	// Set vertical displacement CSS
	const setFgDisp = displacement =>
		landingFg.style.top = (initFgDisp - displacement).toString() + 'px';
	const setBgDisp = displacement => {
		mottoContainer.style.top = (initMottoDispY + displacement).toString() + 'px';
		landingBg.style.top = clipPathOverlay.style.top = (displacement * 2).toString() + 'px';
	}

	// Initial load
	setFgDisp(0);
	setBgDisp(0);

	const revealedH1s = []; // Wait to set opacity on scroll until faded in on load
	function onInit() {
		// Motto fade-in animation
		forEachElement(mottoContainer.children, (h1, index) => {
			revealedH1s.push(false);
			setTimeout(() => {
				h1.style.opacity = '1';
				setTimeout(() => revealedH1s[index] = true, 500);
			}, (index + 1) * mottoFadeInOffset);
		});
	}

	let landingFgLoaded = false;
	let landingBgLoaded = false;
	const assessImageLoad = () => { if (landingFgLoaded && landingBgLoaded) onInit() };
	landingFg.onload = () => {
		landingFgLoaded = true;
		assessImageLoad();
	}
	landingBg.onload = () => {
		landingBgLoaded = true;
		assessImageLoad();
	}

	// Scroll fade in elements
	const categoryScrollFade = new ScrollFadeInGroup(90, 100, 0.2);
	forEachElement(categories.children, category => categoryScrollFade.addElement(category));

	// 5D Spinning on scroll
	const cameraSpinData = {
		container: document.getElementById('camera-spin-container'),
		filepath: '/assets/home/360_spritesheet.webp',
		columns: 8,
		count: 21,
		imgWidth: 810,
		imgHeight: 780
	}
	const cameraSpin = new SpriteSheetScroll(cameraSpinData);

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
		const scrollY = window.scrollY;
		let scrollDownPercentage = scrollY / (landingHeight - headerHeight);
		if (scrollDownPercentage > 1) scrollDownPercentage = 1;

		setFgDisp(initFgDisp * scrollDownPercentage);
		setBgDisp(landingHeight * scrollDownPercentage * bgParallax);
		clipPathOverlay.style.opacity = 1 - scrollDownPercentage * 2;

		forEachElement(mottoContainer.children, (h1, index) => {
			const threshold = index * mottoOffset;
			let displacement = Math.pow(scrollY - threshold, 2) * mottoVelocity;
			if (
				scrollY >= threshold && // delay until offset factor reached
				scrollY < landingHeight && // stop after scroll passes landing
				displacement < mottoLeft + mottoWidth // stop after motto reaches left side
			)
				h1.style.right = displacement.toString() + 'px';
			else h1.style.right = '0';
			if (revealedH1s[index]) // only calc opacity if visible
				h1.style.opacity = 1 - displacement / (windowWidth / 4);
		});

		categoryScrollFade.onScroll(scrollY);
		cameraSpin.onScroll(scrollY);
	}

	function onResize() {
		setSize();
		categoryScrollFade.toggleOffset(windowWidth > 767);
		cameraSpin.onResize();
		onScroll();
	}

	onResize();

	return { onScroll, onResize };
}

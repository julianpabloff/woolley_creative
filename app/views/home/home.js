import { forEachElement } from '../../utils/elements.js';
import { ScrollFadeInGroup } from '../../utils/animations.js';

export default function Home() {
	// Get DOM elements
	const header = document.getElementById('header');
	const landingFg = document.getElementById('landing-fg');
	const landingBg = document.getElementById('landing-bg');
	const clipPathOverlay = document.getElementById('landing-bg-overlay');
	const mottoContainer = document.getElementById('motto-container');
	const categories = document.getElementById('categories-section');
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

	// Motto fade-in animation
	const revealedH1s = []; // Wait to set opacity on scroll until faded in on load
	forEachElement(mottoContainer.children, (h1, index) => {
		revealedH1s.push(false);
		setTimeout(() => {
			h1.style.opacity = '1';
			setTimeout(() => revealedH1s[index] = true, 500);
		}, (index + 1) * mottoFadeInOffset);
	});

	// Scroll fade in elements
	const categoryScrollFade = new ScrollFadeInGroup(90, 50, 50);
	forEachElement(categories.children, category => categoryScrollFade.addElement(category));

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
			if (revealedH1s[index])
				h1.style.opacity = 1 - displacement / (windowWidth / 4);
		});

		categoryScrollFade.onScroll(scrollY);
	}

	function onResize() {
		setSize();
		categoryScrollFade.toggleOffset(windowWidth > 767);
		onScroll();
	}

	onResize();

	return { onScroll, onResize };
}

import { forEachElement } from '../../utils/functions.js';
import { scrollFadeIn, ScrollFadeInElement } from '../../utils/animations.js';

export default function Home() {
	// Get DOM elements
	const landingFg = document.getElementById('landing-fg');
	const landingBg = document.getElementById('landing-bg');
	const landingBgOverlay = document.getElementById('landing-bg-overlay');
	const mottoContainer = document.getElementById('motto-container');
	const categories = document.getElementById('categories-section');

	// Initial values
	const headerHeight = 100; // px
	const initFgDisp = 100; // px
	const bgParallax = 0.3; // multiplier
	const mottoOffset = 75; // px
	const mottoFadeInOffset = 300; // ms
	const mottoVelocity = 0.0015; // multiplier

	let landingHeight, initMottoDispY;
	function setSize() {
		landingHeight = landingFg.clientHeight; // px
		initMottoDispY = landingHeight / 2 - mottoContainer.clientHeight / 2; // px
	}
	setSize();

	function setFgDisplacement(displacement) {
		landingFg.style.top = (initFgDisp - displacement).toString() + 'px';
	}
	function setBgDisplacement(displacement) {
		mottoContainer.style.top = (initMottoDispY + displacement).toString() + 'px';
		landingBg.style.top = landingBgOverlay.style.top = (displacement * 2).toString() + 'px';
	}
	setFgDisplacement(0);
	setBgDisplacement(0);

	// Motto fade-in animation
	const rightTransition = 'right 0.2s ease-out';
	const revealedH1s = []; // Wait to set opacity on scroll until faded in on load
	forEachElement(mottoContainer.children, (h1, index) => {
		h1.style.transition = rightTransition + ', opacity 0.5s ease-out';
		revealedH1s.push(false);
		setTimeout(() => {
			h1.style.opacity = '1';
			setTimeout(() => {
				h1.style.transition = rightTransition
				revealedH1s[index] = true;
			}, 500);
		}, (index + 1) * mottoFadeInOffset);
	});

	const scrollFadeIns = [];
	forEachElement(categories.children, (category, index) => {
		scrollFadeIns.push(new ScrollFadeInElement(category));
	});

	function onScroll() {
		const scrollY = window.scrollY;

		// Landing image vertical displacements
		let scrollDownPercentage = scrollY / (landingHeight - headerHeight);
		if (scrollDownPercentage > 1) scrollDownPercentage = 1;
		const fgDisp = initFgDisp * scrollDownPercentage;
		setFgDisplacement(fgDisp);

		let bgDisp = scrollY * bgParallax;
		if (scrollY > landingHeight) bgDisp = landingHeight * bgParallax;
		setBgDisplacement(bgDisp);
		landingBgOverlay.style.opacity = 1 - scrollDownPercentage * 2;

		// Landing image motto horizontal displacement
		const maxChildDisplacement = mottoContainer.offsetLeft + mottoContainer.clientWidth;
		forEachElement(mottoContainer.children, (h1, index) => {
			const threshold = index * mottoOffset;
			let displacement = Math.pow(scrollY - threshold, 2) * mottoVelocity;
			if (scrollY >= threshold) {
				if (displacement > maxChildDisplacement) displacement = maxChildDisplacement;
				h1.style.right = displacement.toString() + 'px';
			} else h1.style.right = '0';
			if (revealedH1s[index]) h1.style.opacity = 1 - displacement / (window.innerWidth / 4);
		});

		// Category fade-in
		// categoriesOnScroll.forEach(onScroll => onScroll(scrollY));
		let i = 0;
		scrollFadeIns.forEach(scrollFadeIn => {
			scrollFadeIn.offset = 50 + 90 * i * (window.innerWidth > 767);
			scrollFadeIn.onScroll(scrollY);
			i++;
		});
	}

	function onResize() {
		scrollFadeIns.forEach(scrollFadeIn => scrollFadeIn.onResize());
		setSize();
		onScroll();
	}
	onResize();

	return { onScroll, onResize };
}

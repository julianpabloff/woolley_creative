export default function Home() {
	// Get DOM elements
	const landingFg = document.getElementById('landing-fg');
	const landingFgHeight = landingFg.clientHeight;
	const mottoContainer = document.getElementById('motto-container');
	const mottoChildren = mottoContainer.children;

	// Initial values
	const headerHeight = 100; // px
	const initLandingDisp = 100; // px
	const initMottoDispY = landingFgHeight / 2 - mottoContainer.clientHeight / 2; // px
	const mottoParallax = 0.3; // multiplier
	const mottoOffset = 70; // px
	const mottoFadeInOffset = 300; // ms
	const mottoVelocity = 0.0015; // multiplier

	function setFgDisplacement(displacement) {
		landingFg.style.top = (initLandingDisp - displacement).toString() + 'px';
	}
	function setBgDisplacement(displacement) {
		mottoContainer.style.top = (initMottoDispY + displacement).toString() + 'px';
	}
	setFgDisplacement(0);
	setBgDisplacement(0);

	function forEachMottoChild(callback) {
		const mottoChildCount = mottoChildren.length;
		let i = 0;
		while (i < mottoChildCount) {
			callback(mottoChildren[i], i);
			i++;
		}
	}

	// Fade-in animation
	const rightTransition = 'right 0.3s ease-out';
	forEachMottoChild((h1, index) => {
		h1.style.transition = rightTransition + ', opacity 1s ease-out';
		setTimeout(() => {
			h1.style.opacity = '1';
			setTimeout(() => h1.style.transition = rightTransition, 1000);
		}, index * mottoFadeInOffset);
	});

	function onScroll(scrollY) {
		let landingDisp = initLandingDisp * scrollY / (landingFgHeight - headerHeight);
		if (landingDisp > initLandingDisp) landingDisp = initLandingDisp;
		setFgDisplacement(landingDisp);

		let mottoDispY = scrollY * mottoParallax;
		if (scrollY > landingFgHeight) mottoDispY = landingFgHeight * mottoParallax;
		setBgDisplacement(mottoDispY);

		const maxChildDisplacement = mottoContainer.offsetLeft + mottoContainer.clientWidth;
		forEachMottoChild((h1, index) => {
			const threshold = index * mottoOffset;
			if (scrollY >= threshold) {
				let displacement = Math.pow(scrollY - threshold, 2) * mottoVelocity;
				if (displacement > maxChildDisplacement) displacement = maxChildDisplacement;
				h1.style.right = displacement.toString() + 'px';
				h1.style.opacity = 1 - displacement / (window.innerWidth / 4);
			} else h1.style.right = '0';
		});
	}

	return { onScroll };
}

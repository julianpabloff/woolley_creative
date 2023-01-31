window.addEventListener('load', function() {
	const mottoContainer = document.getElementById('motto-container');
	const mottoChildren = [];
	for (const child of mottoContainer.children) mottoChildren.push(child);
	const mottoChildHeight = mottoChildren[0].clientHeight;
	console.log(mottoContainer);
	console.log(mottoChildren);

	function setMottoChildOpacity(child, index, effectiveChildHeight) {
		// const opacity = -1 * scrollY / (landingImageHalfwayPointScrollY - 100 * (2 - index)) + 1; // fade top first
		// const opacity = -1 * scrollY / (landingImageHalfwayPointScrollY + mottoChildHeight * (2 - index)) + 1; // fade bottom first
		const opacity = -1 * (scrollY - effectiveChildHeight * (2 - index)) / landingImageHalfwayPointScrollY + 1;
		let opacityString;
		if (opacity > 0 && opacity < 1) opacityString = opacity.toString();
		else if (opacity <= 0) opacityString = '0';
		else opacityString = '1';
		// child.style.opacity = opacity > 0 ? opacity.toString() : '0';
		child.style.opacity = opacityString;
	}

	function handleMottoDisplacement() {
		const availableDisplacement = 1100 - mottoTop - mottoContainer.clientHeight;
		const displacement = availableDisplacement / landingImageHalfwayPointScrollY * scrollY; // 1100 = Height of the landing image; 400 = available displacement before motto leaks out of image
		// Y = X(400 / threshold); X = scrollY;
		mottoContainer.style.transform = 'translateY(' + displacement + 'px)';
		currentMottoDisplacement = mottoTop + displacement;

		// The actual scroll difference between two words, a little more that 105px, since the words move slower than the scroll
		const effectiveChildHeight = landingImageHalfwayPointScrollY * mottoChildHeight / availableDisplacement

		let i = 0;
		for (const child of mottoChildren) {
			if ((mottoChildrenRevealed & 1 << i) > 0) setMottoChildOpacity(child, i, effectiveChildHeight);
			i++;
		}
	}

	let mottoChildrenRevealed = 0 | 0; // 0 0 0 => 2 1 0 indeces of motto words
	function handleMottoReveal() {
		for (let i = 0; i < mottoChildren.length; i++) {
			// const bitOn = (num, index) => num | 1 << index;
			// const bitOff = (num, index) => num ^= 1 << index;
			// const bitRead = (num, index) => (num & 1 << index) > 0;
			const childVisible = scrollY + windowHeight > currentMottoDisplacement + mottoChildHeight * i + mottoChildHeight / 2;
			// if (scrollY + windowHeight > currentMottoDisplacement + (mottoChildHeight / 2) + mottoChildHeight * i && (mottoChildrenRevealed & 1 << i) == 0) {
			if (childVisible && (mottoChildrenRevealed & 1 << i) == 0) {
				console.log('motto child ' + i + ' visible');
				const child = mottoChildren[i];
				// Reveal motto word
				child.style.left = 0;
				setMottoChildOpacity(child, i);
				setTimeout(() => child.style.transition = 'opacity 0.1s', 1100);
				mottoChildrenRevealed |= 1 << i;
			}
		}
	}

	let scrollY = window.scrollY;

	function setSize() {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		landingImageHalfwayPointScrollY = 1100 - windowHeight / 2; // The scrollY point where the landing image is halfway up the screen - when the motto text should fade away
		mottoTop = mottoContainer.offsetTop;
		currentMottoDisplacement = mottoTop;
	}
	let windowWidth, windowHeight;
	let landingImageHalfwayPointScrollY, mottoTop, currentMottoDisplacement;
	setSize();

	let mobile = !(window.innerWidth > 767);
	const elevatorSection = document.getElementById('elevator-section');
	function handleResize() {
		windowHeight = window.innerHeight;
		windowWidth = window.innerWidth;
		if (windowWidth <= 1024) {
			const displacement = windowWidth - 1024;
			elevatorSection.style['background-position-x'] = displacement + 'px';
		} else {
			elevatorSection.style['background-position-x'] = 'initial';
		}
		if (windowWidth > 767) {
			if (mobile) {
				mottoTop = mottoContainer.offsetTop;
				mobile = false;
			}
		} else if (!mobile) {
			mottoTop = mottoContainer.offsetTop;
			mobile = true;
		}
	}

	handleResize();
	handleMottoReveal();
	handleMottoDisplacement();


	///// CATEGORIES /////
	const categoryContainer = document.getElementById('category-container');
	console.log(categoryContainer);
	const categories = [];
	for (const child of categoryContainer.children) categories.push(child);
	const categoryTop = categoryContainer.offsetTop;
	const categoryHeight = categories[0].clientHeight;
	console.log(categoryContainer);
	console.log(categories);
	console.log(categoryTop);
	const categoryBeginningScroll = categoryTop - windowHeight;
	const categoryHalfScroll = categoryTop + categoryHeight / 2 - windowHeight / 2;

	function handleCategoryOpacity() {
		let i = 0;
		for (const child of categories) {
			const mobile = windowWidth < 767;
			const offset = 100 * !mobile + 35 * i;
			const top = categoryTop + categoryHeight * i * mobile;
			const beginning = top - windowHeight + offset;
			const halfway = top + categoryHeight / 2 - windowHeight / 2;
			const opacity = (scrollY - beginning) / (halfway - beginning);
			child.style.opacity = opacity > 0 ? opacity.toString() : '0';
			i++;
		}
	}

	document.addEventListener('scroll', event => {
		scrollY = window.scrollY;
		handleMottoDisplacement(); // must be called first because its displacement affects when the motto gets revealed
		if (mottoChildrenRevealed < 7) handleMottoReveal(); // 1 1 1 => 2 1 0 indeces of motto words

		handleCategoryOpacity();
	});

	window.addEventListener('resize', event => {
		handleResize();
		handleMottoDisplacement();
	});

	setTimeout(() => mottoContainer.style.transition = 'transform 1s cubic-bezier(0, 0.33, 0.07, 1.03)', 200);
});

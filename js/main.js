window.addEventListener('load', function() {
	let scrollY = window.scrollY;

	///// MOTTO /////
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
		const fadeEarlyOffset = 200 * !mobile;
		const availableDisplacement = 1100 - mottoTop - mottoContainer.clientHeight - fadeEarlyOffset;
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

	function setSize() {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		mottoTop = mottoContainer.offsetTop;
		currentMottoDisplacement = mottoTop;
	}
	let windowWidth, windowHeight;
	let landingImageHalfwayPointScrollY, mottoTop, currentMottoDisplacement;
	setSize();

	let mobile = !(window.innerWidth > 767);
	const elevatorSection = document.getElementById('elevator-section');
	// const whyWoolleyTextContainer = document.getElementById('why-whoolley-text-container');
	// console.log(whyWoolleyTextContainer);
	function handleResize() {
		windowHeight = window.innerHeight;
		windowWidth = window.innerWidth;
		landingImageHalfwayPointScrollY = 900 - windowHeight / 2; // The scrollY point where the landing image is halfway up the screen - when the motto text should fade away
		if (windowWidth <= 1024) {
			const displacement = windowWidth - 1024;
			elevatorSection.style['background-position-x'] = displacement + 'px';
			// const centerX = windowWidth / 2 - whyWoolleyTextContainer.clientWidth / 2;
			// whyWoolleyTextContainer.style.left = centerX.toString() + 'px';
		} else {
			elevatorSection.style['background-position-x'] = 'initial';
			// whyWoolleyTextContainer.style.transition = 'left 0.5s';
			// whyWoolleyTextContainer.style.left = '0';
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


	class scrollFadeInElement {
		constructor(element, offset = 0) {
			this.element = element;
			this.top = element.offsetTop;
			this.height = element.clientHeight;
			this.offset = offset;
		}
		handleOpacity(scrollY) {
			const beginning = this.top - windowHeight + this.offset;
			const halfway = this.top + this.height / 2 - windowHeight / 2;
			const opacity = (scrollY - beginning) / (halfway - beginning);
			this.element.style.opacity = opacity > 0 ? opacity.toString() : '0';
		}
		handleResize() {
			this.top = this.element.offsetTop;
			this.height = this.element.clientHeight;
		}
		update() {
			this.handleResize();
			this.handleOpacity(window.scrollY);
		}
	}


	///// CATEGORIES /////
	const categoryContainer = document.getElementById('category-container');
	console.log(categoryContainer);

	function updateCategoryFadeIn(scrollFade, index) {
		scrollFade.handleResize();
		scrollFade.handleOpacity(scrollY);
		scrollFade.offset = 50 + 90 * index * (windowWidth >= 767);
	}
	function updateCategoryFadeIns() {
		let i = 0;
		for (const scrollFade of categoryScrollFades) {
			updateCategoryFadeIn(scrollFade, i);
			i++;
		}
	}

	const categoryScrollFades = [];
	const categoryChildrenLength = categoryContainer.children.length;
	for (let i = 0; i < categoryChildrenLength; i++) {
		const child = categoryContainer.children[i];
		const categoryFadeIn = new scrollFadeInElement(child);
		updateCategoryFadeIn(categoryFadeIn, i);
		categoryScrollFades.push(categoryFadeIn);
	}


	///// WHY WHOOLLEY /////
	const whyWhoolleyHeader = document.getElementById('why-whoolley-header');
	const whyWhoolleyTop = whyWhoolleyHeader.offsetTop;
	const whyWhoolleyHeight = whyWhoolleyTop.clientHeight;
	console.log(whyWhoolleyHeader);

	const whyWhoolleyHeaderFadeIn = new scrollFadeInElement(whyWhoolleyHeader, 50);

	document.addEventListener('scroll', event => {
		scrollY = window.scrollY;
		handleMottoDisplacement(); // must be called first because its displacement affects when the motto gets revealed
		if (mottoChildrenRevealed < 7) handleMottoReveal(); // 1 1 1 => 2 1 0 indeces of motto words
		updateCategoryFadeIns();
		whyWhoolleyHeaderFadeIn.update();
	});

	window.addEventListener('resize', event => {
		handleResize();
		handleMottoDisplacement();
		updateCategoryFadeIns();
		whyWhoolleyHeaderFadeIn.update();
	});

	setTimeout(() => mottoContainer.style.transition = 'transform 1s cubic-bezier(0, 0.33, 0.07, 1.03)', 200);
});

window.addEventListener('load', function() {
	let scrollY = window.scrollY;
	const topSection = document.getElementById('top-section');
	const landingImageHeight = topSection.clientHeight;
	const header = document.getElementById('header');
	const headerHeight = header.clientHeight;

	///// MOTTO /////
	const mottoContainer = document.getElementById('motto-container');
	const mottoHeight = mottoContainer.clientHeight;
	const mottoChildren = [];
	for (const child of mottoContainer.children) mottoChildren.push(child);
	const mottoChildHeight = mottoChildren[0].clientHeight;

	function setMottoChildOpacity(child, index) {
		const coveredAbove = (headerHeight - mottoTop) / (parallaxRate - 1);
		const coveredBelow = (landingImageHeight - mottoHeight - mottoTop) / parallaxRate;
		let offset;
		if (coveredAbove <= coveredBelow) offset = mottoChildHeight * index;
		else offset = -1 * mottoChildHeight * (2 - index);
		const scrollYEndpoint = Math.min(coveredAbove, coveredBelow) + offset;
		const opacity = (scrollYEndpoint - scrollY) / scrollYEndpoint;

		let opacityString;
		if (opacity > 0 && opacity < 1) opacityString = opacity.toString();
		else if (opacity <= 0) opacityString = '0';
		else opacityString = '1';
		child.style.opacity = opacityString;

		return opacity;
	}

	let mottoChildrenRevealed = 0 | 0; // 0 0 0 => 2 1 0 indeces of motto words
	function handleMottoChildReveal(child, index, opacity) {
		const indexDisplacement = mottoChildHeight * index + mottoChildHeight / 2;
		const visibleFromAbove = scrollY + windowHeight > currentMottoDisplacement + indexDisplacement;
		const visibleFromBelow = scrollY < currentMottoDisplacement - headerHeight + indexDisplacement;
		if (opacity > 0.2 && visibleFromAbove && visibleFromBelow && (mottoChildrenRevealed & 1 << index) == 0) {
			// Reveal motto word
			child.style.left = 0;
			setTimeout(() => child.style.transition = 'opacity 0.1s', landingImageHeight);
			mottoChildrenRevealed |= 1 << index;
		}
	}

	const parallaxRate = 0.4;
	function handleMottoDisplay() {
		const displacement = parallaxRate * scrollY;
		mottoContainer.style.transform = 'translateY(' + displacement + 'px)';
		currentMottoDisplacement = mottoTop + displacement;

		for (let i = 0; i < mottoChildren.length; i++) {
			const child = mottoChildren[i];
			const opacity = setMottoChildOpacity(child, i);
			if (mottoChildrenRevealed < 7) handleMottoChildReveal(child, i, opacity);
		}
	}

	function setSize() {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		mottoTop = mottoContainer.offsetTop;
		currentMottoDisplacement = mottoTop;
	}
	let windowWidth, windowHeight;
	let mottoTop, currentMottoDisplacement;
	setSize();

	let mobile = !(window.innerWidth > 767);
	// const elevatorSection = document.getElementById('elevator-section');
	function handleResize() {
		windowHeight = window.innerHeight;
		windowWidth = window.innerWidth;
		// if (windowWidth <= 1024) {
			// const displacement = windowWidth - 1024;
			// elevatorSection.style['background-position-x'] = displacement + 'px';
		// } else elevatorSection.style['background-position-x'] = 'initial';
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
	handleMottoDisplay();


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
	const whyWhoolleyHeaderFadeIn = new scrollFadeInElement(whyWhoolleyHeader, 50);


	///// DREAMERS /////
	const dreamers = document.querySelector('section#dreamers-section div.dreamers-container');
	const dreamersParallaxFactor = 0.08;
	function handleDreamers() {
		const dreamersHalfScrollPoint = dreamers.offsetTop + dreamers.clientHeight / 2 - windowHeight / 2;
		const translate = (dreamersHalfScrollPoint - scrollY) * dreamersParallaxFactor;
		dreamers.style.transform = 'translateY(' + translate + 'px)';
	}
	handleDreamers();


	document.addEventListener('scroll', event => {
		scrollY = window.scrollY;
		handleMottoDisplay();
		updateCategoryFadeIns();
		whyWhoolleyHeaderFadeIn.update();
		handleDreamers();
	});

	window.addEventListener('resize', event => {
		handleResize();
		handleMottoDisplay();
		updateCategoryFadeIns();
		whyWhoolleyHeaderFadeIn.update();
		handleDreamers();
	});

	setTimeout(() => mottoContainer.style.transition = 'transform 1s cubic-bezier(0, 0.33, 0.07, 1.03)', 200);
});

const HomeComponent = function(root) {
	document.title = 'Woolley Creative – We create outside.';
	let scrollY = window.scrollY;
	let windowWidth = window.innerWidth;
	let windowHeight = window.innerHeight;
	let mobile = !(windowWidth > 767);
	const header = document.getElementById('header');
	const headerHeight = header.clientHeight;

	// SLIDEOUTS
	const slideouts = new SlideoutManager(document, headerHeight + 50, 50);
	// PARALLAX SCROLL ELEMENTS
	const parallaxScrolls = new ParallaxScrollManager(root);

	// MOTTO
	const topSection = document.getElementById('top-section');
	const landingImageHeight = topSection.clientHeight + topSection.offsetTop;

	const mottoContainer = document.getElementById('motto-container');
	const mottoHeight = mottoContainer.clientHeight;
	let mottoTop = mottoContainer.offsetTop;
	let currentMottoDisplacement = mottoTop;
	const mottoChildren = [];
	for (const child of mottoContainer.children) mottoChildren.push(child);
	const mottoChildHeight = mottoChildren[0].clientHeight;

	const setMottoChildOpacity = function(child, index) {
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

	let mottoChildrenRevealed = 0 | 0;
	const handleMottoChildReveal = function(child, index, opacity) {
		const indexDisplacement = mottoChildHeight * index + mottoChildHeight / 2;
		const visibleFromAbove = scrollY + windowHeight > currentMottoDisplacement + indexDisplacement;
		const visibleFromBelow = scrollY < currentMottoDisplacement - headerHeight + indexDisplacement;
		if (opacity > 0.2 && visibleFromAbove && visibleFromBelow && (mottoChildrenRevealed & 1 << index) == 0) {
			child.style.left = 0;
			setTimeout(() => child.style.transition = 'opacity 0.1s', 1000);
			mottoChildrenRevealed |= 1 << index;
		}
	}

	const parallaxRate = 0.4;
	const handleMottoDisplay = function() {
		const displacement = parallaxRate * scrollY;
		mottoContainer.style.transform = 'translateY(' + displacement + 'px)';
		currentMottoDisplacement = mottoTop + displacement;

		for (let i = 0; i < mottoChildren.length; i++) {
			const child = mottoChildren[i];
			const opacity = setMottoChildOpacity(child, i);
			if (mottoChildrenRevealed < 7) handleMottoChildReveal(child, i, opacity);
		}
	}
	setTimeout(() => mottoContainer.style.transition = 'transform 1s cubic-bezier(0, 0.33, 0.07, 1.03)', 200);


	// CATEGORIES
	const categoryContainer = document.getElementById('category-container');
	function updateCategoryFadeIn(scrollFade, index) {
		scrollFade.update();
		scrollFade.offset = 50 + 90 * index * !mobile;
	}
	const categoryScrollFades = [];
	const categoryChildrenLength = categoryContainer.children.length;
	for (let i = 0; i < categoryChildrenLength; i++) {
		const child = categoryContainer.children[i];
		const categoryFadeIn = new scrollFadeInElement(child);
		updateCategoryFadeIn(categoryFadeIn, i);
		categoryScrollFades.push(categoryFadeIn);
	}


	// WHY WOOLLEY
	const whyWoolleyHeader = document.getElementById('why-whoolley-header');
	const whyWoolleyHeaderFadeIn = new scrollFadeInElement(whyWoolleyHeader, 50);


	this.update = function() {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		scrollY = window.scrollY;

		if (windowWidth > 767) {
			if (mobile) {
				mottoTop = mottoContainer.offsetTop;
				mobile = false;
			}
		} else if (!mobile) {
			mottoTop = mottoContainer.offsetTop;
			mobile = true;
		}

		handleMottoDisplay();
		let i = 0;
		for (const scrollFade of categoryScrollFades) {
			updateCategoryFadeIn(scrollFade, i);
			i++;
		}
		whyWoolleyHeaderFadeIn.update();
		slideouts.update();
		parallaxScrolls.update();
	}
	this.update();
}

export default HomeComponent;

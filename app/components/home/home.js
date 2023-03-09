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
	console.log(window.innerHeight);
	console.log(landingImageHeight);

	const mottoContainer = document.getElementById('motto-container');
	const mottoHeight = mottoContainer.clientHeight;
	let mottoTop = mottoContainer.offsetTop;
	let currentMottoDisplacement = mottoTop;
	const mottoChildren = mottoContainer.children;
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

	let mottoChildrenWithinView = 0 | 0;
	let mottoChildrenRevealed = 0 | 0;

	const isMottoChildWithinView = function(index) {
		const indexDisplacement = mottoChildHeight * index + mottoChildHeight / 2;
		const visibleFromAbove = scrollY + windowHeight > currentMottoDisplacement + indexDisplacement;
		const visibleFromBelow = scrollY < currentMottoDisplacement - headerHeight + indexDisplacement;
		if (visibleFromAbove && visibleFromBelow) {
			mottoChildrenWithinView |= 1 << index;
			return true;
		}
		mottoChildrenWithinView &= ~(1 << index)
		return false;
	}

	const handleMottoChildReveal = function(child, index, opacity) {
		if (opacity > 0.2 && (mottoChildrenRevealed & 1 << index) == 0) {
			child.style.left = 0;
			setTimeout(() => child.style.transition = 'opacity 0.1s', 1000);
			mottoChildrenRevealed |= 1 << index;
		}
	}

	const revealMottoChild = function(child) {
		child.style.left = 0;
		setTimeout(() => child.style.transition = 'opacity 0.1s', 1000);
		mottoChildrenRevealed |= 1 << index;
	}

	const parallaxRate = 0.4;
	let handleMottoDisplay = function() {
		let displacement = parallaxRate * scrollY;
		if (displacement > landingImageHeight) displacement = landingImageHeight;
		mottoContainer.style.transform = 'translateY(' + displacement + 'px)';
		currentMottoDisplacement = mottoTop + displacement;

		const initialChildrenRevealed = mottoChildrenRevealed;
		for (let i = 0; i < mottoChildren.length; i++) {
			const child = mottoChildren[i];
			const opacity = setMottoChildOpacity(child, i);
			const withinView = isMottoChildWithinView(i);
			if (withinView) setTimeout(() => handleMottoChildReveal(child, i, opacity), 200 * i);
		}
		if (mottoChildrenWithinView == 7) {
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
	setTimeout(this.update, 300);
}

export default HomeComponent;

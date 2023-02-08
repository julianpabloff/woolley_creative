class scrollFadeInElement {
	constructor(element, offset = 0) {
		this.element = element;
		this.top = element.offsetTop;
		this.height = element.clientHeight;
		this.offset = offset;
		this.element.style.transition = 'opacity 0.1s';
	}
	handleOpacity() {
		const windowHeight = window.innerHeight;
		const beginning = this.top - windowHeight + this.offset;
		const halfway = this.top + this.height / 2 - windowHeight / 2;
		const opacity = (window.scrollY - beginning) / (halfway - beginning);
		this.element.style.opacity = opacity > 0 ? opacity.toString() : '0';
	}
	handleResize() {
		this.top = this.element.offsetTop;
		this.height = this.element.clientHeight;
	}
	update() {
		this.handleResize();
		this.handleOpacity();
	}
}

class SlideoutElement {
	constructor(element, side = true, topPadding = 0, bottomPadding = 0) {
		this.element = element;
		this.container = document.createElement('div');
		this.container.style.width = 'fit-content';
		this.element.parentNode.insertBefore(this.container, this.element);
		this.container.appendChild(this.element);

		this.width = this.element.clientWidth;
		this.height = this.element.clientHeight;
		this.side = side;
		this.topPadding = topPadding;
		this.bottomPadding = bottomPadding;
		this.revealed = true;

		this.element.style.opacity = '0';
		this.element.style.position = 'relative';
		this.element.style.transition = 'left ease-out 0.75s, opacity 1s';
		this.hideElement();
		setTimeout(() => {
			this.revealed = false;
			this.update(window.scrollY, window.innerHeight);
		}, 0);

	}
	hideElement() {
		this.x = this.container.offsetLeft;
		this.y = this.container.offsetTop;
		if (this.side) {
			const offset = (0 - this.x - this.width - 5);
			this.element.style.left = offset.toString() + 'px';
		}
		else this.element.style.left = `calc(100vw - ${this.x - 5}px`;
	}
	update(scrollY, windowHeight) {
		if (this.revealed) return;
		this.hideElement();
		const topVisible = this.y - windowHeight + this.bottomPadding;
		const bottomVisible = this.y - this.topPadding;
		if (scrollY > topVisible && scrollY < bottomVisible) {
			this.element.style.left = '0';
			this.element.style.opacity = '1';
			this.revealed = true;
		}
	}
}
class SlideoutManager {
	constructor(container, topPadding = 50, bottomPadding = 50) {
		this.container = container;
		this.instances = [];
		const leftSlideouts = this.container.getElementsByClassName('slideout-left');
		const rightSlideouts = this.container.getElementsByClassName('slideout-right');
		for (const element of leftSlideouts) this.instances.push(new SlideoutElement(element, true, topPadding, bottomPadding));
		for (const element of rightSlideouts) this.instances.push(new SlideoutElement(element, false, topPadding, bottomPadding));
	}
	update() {
		const scrollY = window.scrollY;
		const windowHeight = window.innerHeight;
		for (const instance of this.instances) instance.update(scrollY, windowHeight);
	}
}

class ParallaxScrollElement {
	constructor(element, parallaxFactor = 0.08) {
		this.element = element;
		this.parallaxFactor = parallaxFactor;
		this.element.style.transition = 'transform 0.2s';
	}
	update(scrollY, windowHeight) {
		const top = this.element.offsetTop;
		const height = this.element.clientHeight;
		const vertCenteredScrollPoint = top + height / 2 - windowHeight / 2;
		const translate = (vertCenteredScrollPoint - scrollY) * this.parallaxFactor;
		this.element.style.transform = 'translateY(' + translate.toString() + 'px)';
	}
}
class ParallaxScrollManager {
	constructor(container, parallaxFactor = 0.08) {
		this.container = container;
		this.instances = [];
		const elements = this.container.getElementsByClassName('parallax-scroll');
		for (const element of elements) this.instances.push(new ParallaxScrollElement(element, parallaxFactor));
	}
	update() {
		const scrollY = window.scrollY;
		const windowHeight = window.innerHeight;
		for (const instance of this.instances) instance.update(scrollY, windowHeight);
	}
}

const intervalIterate = async (time, count, callback) => new Promise(resolve => {
	let i = 0;
	const interval = setInterval(() => {
		callback(i);
		i++;
		if (i >= count) {
			clearInterval(interval);
			resolve();
		}
	}, time);
});

class SlideListAnimation {
	constructor(ul, delay = 3000, speed = 100) {
		this.ul = ul;
		this.delay = delay;
		this.speed = speed;

		this.container = document.createElement('div');
		this.ul.parentNode.insertBefore(this.container, this.ul);
		this.container.appendChild(this.ul);
		this.container.style.overflow = 'hidden';

		this.li = this.ul.children;
		this.liHeight = this.li[0].clientHeight;
		this.liCount = this.li.length;
		this.timestep = speed / this.liHeight;

		const ulStyle = this.ul.style;
		ulStyle.height = this.liHeight.toString() + 'px';
		ulStyle.position = 'relative';
		this.setContainerHeight();

		animations.add(this);
		return this;
	}
	setContainerHeight() {
		this.container.style.height = this.li[0].clientHeight.toString() + 'px';
	}
	async move() {
		// The amount of iterations in the loop is the height of the current li element in px
		const currentHeight = this.li[0].clientHeight;
		const nextHeight = this.li[1].clientHeight;
		const heightDelta = (nextHeight - currentHeight) / currentHeight;
		let heightChange = currentHeight;
		await intervalIterate(this.timestep, currentHeight, i => {
			this.ul.style.top = `-${i + 1}px`;
			if (heightDelta) {
				heightChange += heightDelta;
				this.container.style.height = heightChange.toString() + 'px';
			}
		});
		this.ul.appendChild(this.ul.removeChild(this.li[0]));
		this.ul.style.top = '0';
	}
	start() {
		this.animation = setInterval(() => this.move(), this.delay);
		return this;
	}
	stop() {
		if (this.animation) clearInterval(this.animation);
		return this;
	}
}
const animations = new Set();
const startAnimations = () => animations.forEach(a => a.start());
const stopAnimations = () => animations.forEach(a => a.stop());

document.addEventListener('visibilitychange', () => {
	console.log(document.visibilityState);
	if (document.hidden) stopAnimations();
	else startAnimations();
});

const homeLink = document.getElementById('home-link');
homeLink.addEventListener('click', e => route(e));

const menuButton = document.getElementById('menu-hamburger');
const navOverlay = document.getElementById('nav-overlay-container');
const menuContainer = document.getElementById('menu-container');
const menuExitButton = document.getElementById('menu-exit-button');

const revealMenu = () => {
	navOverlay.style.display = 'initial';
	menuContainer.style.left = '0';
	menuContainer.style.opacity = '1';
};
const hideMenu = () => {
	navOverlay.style.display = 'none';
	menuContainer.style.left = '-50%';
	menuContainer.style.opacity = '0';
};

menuButton.addEventListener('click', revealMenu);
menuExitButton.addEventListener('click', hideMenu);
navOverlay.addEventListener('click', event => { if (event.target == navOverlay) hideMenu() });

window.addEventListener('beforeunload', () => {
	localStorage.setItem('scrollpos', window.scrollY);
});

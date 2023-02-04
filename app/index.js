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

class slideInElement {
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
		setTimeout(() => {
			this.element.style.transition = 'left ease-out 0.75s, opacity 1s';
			this.revealed = false;
			this.update();
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
	update() {
		if (this.revealed) return;
		this.hideElement();
		const windowHeight = window.innerHeight;
		const scrollY = window.scrollY;
		const topVisible = this.y - windowHeight + this.bottomPadding;
		const bottomVisible = this.y - this.topPadding;
		if (scrollY > topVisible && scrollY < bottomVisible) {
			this.element.style.left = '0';
			this.element.style.opacity = '1';
			console.log('revealing slideout: ' + this.element.innerText);
			this.revealed = true;
		}
	}
}
function createSlideoutsInContainer(container, topPadding, bottomPadding) {
	const slideouts = [];
	const leftSlideouts = container.getElementsByClassName('slideout-left');
	const rightSlideouts = container.getElementsByClassName('slideout-right');
	for (const element of leftSlideouts) slideouts.push(new slideInElement(element, true, topPadding, bottomPadding));
	for (const element of rightSlideouts) slideouts.push(new slideInElement(element, false, topPadding, bottomPadding));
	// console.log(slideouts);
	return slideouts;
}

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

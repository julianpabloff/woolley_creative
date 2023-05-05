import { forEachElement } from './utils/functions.js';

export default function Index() {
	const headerBackground = document.getElementById('header-background');

	let threshold;
	const setThreshold = () => threshold = Math.min(200, window.innerHeight / 2);
	setThreshold();

	function onScroll() {
		const scrollY = window.scrollY
		if (scrollY < threshold) {
			headerBackground.style.opacity = 1 - (threshold - scrollY) / threshold;
		}
		else headerBackground.style.opacity = '1';
	}

	function onResize() {
		setThreshold();
		onScroll();
	}

	// Nav menu
	const overlay = document.getElementById('menu-overlay');
	const menu = document.getElementById('menu');
	const menuButton = document.getElementById('menu-hamburger');
	const menuExit = document.getElementById('menu-exit-button');
	const menuLinks = document.getElementById('menu-nav').children;

	function revealMenu()  {
		overlay.style.display = 'initial';
		menu.style.display = 'flex';
		setTimeout(() => {
			overlay.style.opacity = menu.style.opacity = '1'
			menu.style.left = '0';
		}, 10);
	}

	function hideMenu() {
		overlay.style.opacity = '0';
		setTimeout(() => overlay.style.display = menu.style.display = 'none', 200);
		menu.style.left = '-50%';
		menu.style.opacity = '0';
	}

	menuButton.addEventListener('click', revealMenu);
	menuExit.addEventListener('click', hideMenu);
	overlay.addEventListener('click', e => { if (e.target == overlay) hideMenu() });
	forEachElement(menuLinks, link => link.addEventListener('click', hideMenu));

	return { onScroll, onResize };
}

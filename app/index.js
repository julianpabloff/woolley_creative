import { intervalIterate } from './utils/animations.js';
import { forEachElement } from './utils/elements.js';

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
	onScroll();

	function onResize() {
		setThreshold();
		onScroll();
	}

	// Nav menu
	const menuOverlay = document.getElementById('menu-overlay');
	const menu = document.getElementById('menu');
	const menuButton = document.getElementById('menu-hamburger');
	const menuExit = document.getElementById('menu-exit-button');
	const menuLinks = document.getElementById('menu-nav').children;

	function showMenu() {
		menuOverlay.style.display = 'initial';
		menu.style.display = 'flex';
		setTimeout(() => {
			menuOverlay.style.opacity = menu.style.opacity = '1'
			menu.style.left = '0';
		}, 10);
		menuButton.style.transform = "rotate(0.5turn)";
	}

	function hideMenu() {
		menuOverlay.style.opacity = '0';
		setTimeout(() => menuOverlay.style.display = menu.style.display = 'none', 200);
		menu.style.left = '-50%';
		menu.style.opacity = '0';
		menuButton.style.transform = "";
	}

	menuButton.addEventListener('click', showMenu);
	menuExit.addEventListener('click', hideMenu);
	menuOverlay.addEventListener('click', e => { if (e.target == menuOverlay) hideMenu() });
	forEachElement(menuLinks, link => link.addEventListener('click', hideMenu));

	// Loading overlay
	const loadingOverlay = document.getElementById('loading-overlay');
	const footer = document.getElementById('footer');

	async function toggleLoading(bool) {
		document.body.style.overflowY = 'hidden';
		if (bool) { // show
			window.scrollTo(0, 0);
			footer.style.display = 'none';
			loadingOverlay.style.display = 'flex';
			loadingOverlay.style.opacity = '1';
		} else { // hide
			footer.style.display = 'block';
			await intervalIterate(10, 100, i => {
				const opacity = 1 - (i + 1) / 100;
				console.log(opacity);
				loadingOverlay.style.opacity = opacity.toString();
			});
			document.body.style.overflowY = 'visible';
			loadingOverlay.style.display = 'none';
		}
	}

	return { onScroll, onResize, toggleLoading };
}

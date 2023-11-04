import { intervalIterate, getBoundedTValue, ScrollTracker } from './utils/animations.js';
import { forEachElement } from './utils/elements.js';

export default function Index() {
	// Get DOM elements
	const headerBackground = document.getElementById('header-background');
	const menuOverlay = document.getElementById('menu-overlay');
	const menu = document.getElementById('menu');
	const menuButton = document.getElementById('menu-hamburger');
	const menuExit = document.getElementById('menu-exit-button');
	const menuLinks = document.getElementById('menu-nav').children;
	const loadingOverlay = document.getElementById('loading-overlay');
	const footer = document.getElementById('footer');
	const footerOverlay = document.getElementById('footer-overlay');

	let threshold;
	const setThreshold = () => threshold = Math.min(200, window.innerHeight / 2);

	const footerTracker = new ScrollTracker(footer);
	const footerDisp = 100;
	function onScroll() {
		const scrollY = window.scrollY;
		headerBackground.style.opacity = getBoundedTValue(0, scrollY, threshold);

		// Footer-specific scroll tracking
		footerTracker.onResize();
		footerTracker.end = footerTracker.start + footerTracker.height;
		footerTracker.onScroll(scrollY);

		const displacement = 100 * (1 - footerTracker.scrollT);
		footer.style.backgroundPositionY = displacement.toString() + 'px';

		const x = (displacement * 1.2).toString() + 'px';
		footerOverlay.style.clipPath =
			`polygon(calc(60% + ${x}) 0, 100% 0, 100% 100%, calc(60% - 450px + ${x}) 100%)`;
	}

	function onResize() {
		setThreshold();
		onScroll();
	}
	onResize();

	// Nav menu
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

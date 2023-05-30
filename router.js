import {
	activateLinks,
	createLinkEvents,
	assignContainer,
	insertHTML,
	insertCSS
} from './view-loader.js';
import { searchForAnimations } from './utils/animations.js';
import addHandlers from './utils/events.js';

import Index from './index.js';
import Home from './views/home/home.js';

const routes = {
	'/': {
		selector: 'home',
		template: '/views/home/home.html',
		styles: '/views/home/home.css',
		initializer: Home
	}
}

// Convert each hardcoded route to a RegExp
const regexRoutes = Array.from(Object.keys(routes).map(path => {
	const regex = '^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '$';
	return { path, regex };
}));

function getView(pathname) {
	let i = 0;
	do {
		const { path, regex } = regexRoutes[i];
		const match = pathname.match(regex);
		if (match) return routes[path];
		i++;
	} while (i < regexRoutes.length);
	return null; // 404
}

/*
async function onReady() {
	activateLinks();
	const storedScrollY = localStorage.getItem('scrollpos');
	window.scrollTo(0, storedScrollY)
	localStorage.setItem('scrollpos', null);
	indexHandlers.toggleLoading(false);
}
*/

let root;
async function handleLocation() {
	// indexHandlers.toggleLoading(true);
	const pathname = window.location.pathname;
	const view = getView(pathname);
	if (view) {
		const viewContainer = assignContainer(view.selector);
		if (view.styles) await insertCSS(view.styles, viewContainer);
		if (view.template) await insertHTML(view.template, root, viewContainer);
		if (view.initializer) {
			// const handlers = view.initializer(onReady);
			const handlers = view.initializer();
			if (handlers) addHandlers('root', handlers);
		}
		searchForAnimations(root);
	} else {
		root.innerHTML = 'no page here';
		// indexHandlers.toggleLoading(false);
	}
	activateLinks();
	const storedScrollY = localStorage.getItem('scrollpos');
	window.scrollTo(0, storedScrollY)
	localStorage.setItem('scrollpos', 0);
}

const prefetched = new Set();
async function preLoad(url) {
	const path = url.pathname;
	if (routes[path] && !prefetched.has(path)) {
		const link = document.createElement('link');
		link.rel = 'prefetch';
		link.href = routes[url.pathname].template;
		link.as = 'document';
		// link.onload = () => console.log('prefetched', routes[url.pathname].name);
		document.head.appendChild(link);
		prefetched.add(path);
	}
}

window.onpopstate = handleLocation;
let indexHandlers;
document.addEventListener('DOMContentLoaded', () => {
	indexHandlers = Index();
	addHandlers('index', indexHandlers);
	root = document.getElementById('root');
	createLinkEvents(handleLocation, preLoad);
	handleLocation();
});

window.addEventListener('beforeunload', () => {
	localStorage.setItem('scrollpos', window.scrollY);
});

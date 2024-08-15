import {
	addStyleSheet,
	assignContainer,
	insertHTML,
	insertCSS,
	ScrollPosController
} from './utils/view-loader.js';
import { searchForAnimations } from './utils/animations.js';
import addHandlers from './utils/events.js';
import { routes } from './utils/routes.js';
import Index from './index.js';

// Convert each hardcoded route to a RegExp
const regexRoutes = Array.from(Object.keys(routes).map(path => {
	// const regex = '^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '$';
	const regex = `^${path.replace(/\//g, '\\/')}(\\/?)$`;
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
	// 404
	console.log('404');
	return routes['404'];
	// return null;
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
let onDestroy;
let pageName;
const scrollPos = new ScrollPosController();

async function handleLocation(fromPageLink = false) {
	if (onDestroy) onDestroy();
	onDestroy = null;
	scrollPos.save(pageName);
	// indexHandlers.toggleLoading(true);

	const pathname = window.location.pathname;
	const view = getView(pathname);
	if (view) {
		pageName = view.selector;
		const viewContainer = assignContainer(pageName);

		if (view.styles) await insertCSS(view.styles, viewContainer);
		if (view.template) await insertHTML(view.template, root, viewContainer);
		if (view.initializer) {
			const handlers = view.initializer();
			if (handlers) {
				addHandlers('root', handlers);
				if (handlers.onDestroy) onDestroy = handlers.onDestroy;
			}
		}
		searchForAnimations(root);
		if (!fromPageLink) scrollPos.load(pageName);
		else scrollPos.reset(pageName);
		// indexHandlers.toggleLoading(false);
	} else {
		root.innerHTML = '';
		// indexHandlers.toggleLoading(false);
	}
	activateLinks();
}

const prefetched = new Set();
async function preLoad(url) {
	const path = url.pathname;
	if (routes[path] && !prefetched.has(path)) {
		const link = document.createElement('link');
		link.rel = 'prefetch';
		link.href = routes[url.pathname].template;
		link.as = 'document';
		link.onload = () => console.log('prefetched', routes[url.pathname].name);
		document.head.appendChild(link);
		prefetched.add(path);
	}
}

// Called at the first page load, creates event handlers for links
let handleLinkClick, handleLinkHover;
export function createLinkEvents(onClick, onHover) {
	handleLinkClick = function(event) {
		event.preventDefault();
		const href = event.currentTarget.href;
		if (href !== (document.location.href || document.location.href + '/')) {
			window.history.pushState(null, null, href);
			onClick();
		} else scrollPos.reset(pageName);
	}
	handleLinkHover = function(event) {
		onHover(new URL(event.target.href));
	}
}

// Assigns link event handlers to links in the document
export function activateLinks() {
	const linkCount = document.links.length;
	let i = 0;
	while (i < linkCount) {
		const link = document.links.item(i);
		if (
			link.href.includes(document.location.origin) &&
			!link.href.includes('#')
		) {
			link.addEventListener('click', handleLinkClick);
			link.addEventListener('pointerenter', handleLinkHover, { once: true });
		}
		i++;
	}
}

window.onpopstate = () => handleLocation(false);
let indexHandlers;
document.addEventListener('DOMContentLoaded', () => {
	indexHandlers = Index();
	addHandlers('index', indexHandlers);
	searchForAnimations(document.body);
	root = document.getElementById('root');
	createLinkEvents(() => handleLocation(true), () => {});
	handleLocation(false);
});

window.addEventListener('beforeunload', () => {
	scrollPos.save(pageName);
});

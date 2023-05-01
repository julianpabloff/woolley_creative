import {
	activateLinks,
	createLinkEvents,
	assignContainer,
	loadHTML,
	loadCSS
} from './view-loader.js';

// '/route': { name, template, styles, initializer },
const routes = {
	'/': {
		name: 'home'
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
	return null;
}

let root;
async function handleLocation() {
	const pathname = window.location.pathname;
	const view = getView(pathname);
	if (view) {
		console.log('loading view:', view);
		const viewContainer = assignContainer(view.name);
		if (view.styles) await loadCSS(view.styles, viewContainer);
		if (view.template) await loadHTML(view.template, root, viewContainer);
		if (view.initializer) view.initializer();
	} else {
		root.innerHTML = '';
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
		// link.onload = () => console.log('prefetched', routes[url.pathname].name);
		document.head.appendChild(link);
		prefetched.add(path);
	}
}

window.onpopstate = handleLocation;
document.addEventListener('DOMContentLoaded', () => {
	root = document.getElementById('root');
	createLinkEvents(handleLocation, preLoad);
	handleLocation();
});

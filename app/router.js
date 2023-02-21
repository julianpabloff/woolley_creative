import HomeComponent from './components/home/home.js';
import AboutComponent from './components/about/about.js';
import ContactComponent from './components/contact/contact.js';

function specifyCSS(css, componentName) {
	const selector = `div#${componentName}-component `;
	let write = false;
	let atRule = false;
	const output = [];
	let lastCode, lastChar;
	for (let i = 0; i < css.length; i++) {
		const code = css.charCodeAt(i);
		const char = css[i];
		if (!write && code >= 33 && code <= 126) {
			if (char != '@' && char != '}') {
				output.push(selector);
			} else if (char == '@') atRule = true;
			write = true;
		}
		if (write && code != 9) {
			lastCode = code;
			lastChar = char;
			output.push(char);
		}
		if (char == '{' && atRule) {
			output.push('\n');
			atRule = false;
			write = false;
		}
		if (char == '}' && write) {
			output.push('\n');
			write = false;
		}
	}
	return output.join('');
}

function route(event) {
	event.preventDefault();
	window.history.pushState({}, "", event.currentTarget.href);
	handleLocation();
};
window.route = route;
const indexLinks = document.querySelectorAll('a.page-link');
for (const link of indexLinks) link.addEventListener('click', e => route(e));

const routes = {
	404: '404',
	'/': 'home',
	'/work': 'work',
	'/about': 'about',
	'/careers': 'careers',
	'/contact': 'contact'
};
const components = {
	'home': HomeComponent,
	'about': AboutComponent,
	'contact': ContactComponent,
}
const componentInstances = {};
let currentComponent;

const root = document.getElementById('root');

function initComponent(componentName) {
	const storedScrollpos = localStorage.getItem('scrollpos');
	const storedCurrentComponent = localStorage.getItem('currentComponent');
	if (storedScrollpos && componentName == storedCurrentComponent) {
		console.log('resetting to stored scroll position:', storedScrollpos);
		window.scrollTo(0, storedScrollpos);
	} else window.scrollTo(0, 0);
	localStorage.setItem('scrollpos', null);

	const links = root.querySelectorAll('a.page-link');
	for (const link of links) link.addEventListener('click', e => route(e));

	if (components[componentName]) {
		componentInstances[componentName] = new components[componentName](root);
	}
	currentComponent = componentName;
	if (menuRevealed) hideMenu();
}

async function handleLocation() {
	const path = window.location.pathname;
	const componentName = routes[path] || routes[404];
	if (componentName == currentComponent) {
		window.scrollTo(0, 0);
		return;
	}
	const filePath = `/components/${componentName}/${componentName}`;
	console.log('switching to ' + componentName + ' component "' + path + '"');

	let html = await fetch(`${filePath}.html`).then(data => data.text());
	const css = await fetch(`${filePath}.css`).then(data => data.text());
	const container = `<div id="${componentName}-component">`;
	html = container.concat(html, '</div>');

	if (css.startsWith('<!DOCTYPE html>')) root.innerHTML = html;
	else root.innerHTML = html.concat('<style>\n', specifyCSS(css, componentName), '</style>');
	initComponent(componentName);
}

handleLocation();
window.onpopstate = handleLocation;

window.addEventListener('scroll', () => {
	const component = componentInstances[currentComponent];
	if (component?.update) component.update();
});
window.addEventListener('resize', () => {
	const component = componentInstances[currentComponent];
	if (component?.update) component.update();
});
window.addEventListener('beforeunload', () => {
	console.log('remembering scroll position:', window.scrollY);
	localStorage.setItem('scrollpos', window.scrollY);
	localStorage.setItem('currentComponent', currentComponent);
});

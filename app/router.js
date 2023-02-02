const route = event => {
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	handleLocation();
};

const routes = {
	404: '404',
	'/': 'home',
	'/work': 'work',
	'/about': 'about',
	'/careers': 'careers',
	'/contact': 'contact'
};

const componentInitFunctions = {};

const root = document.getElementById('root');
const htmlFilePath = '../pages/';
const cssFilePath = '../css/';

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
		if (write) {//&& !(code == 9 && lastCode != 10)) {
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
	console.log(output.join(''));
	return output.join('');
}

const handleLocation = async () => {
	const path = window.location.pathname;
	const component = routes[path] || routes[404];
	const filePath = `components/${component}/${component}`;
	// let html = await fetch(htmlFilePath + component + '.html').then(data => data.text());
	// const css = await fetch(cssFilePath + component + '.css').then(data => data.text());
	let html = await fetch(`${filePath}.html`).then(data => data.text());
	const css = await fetch(`${filePath}.css`).then(data => data.text());
	const container = `<div id="${component}-component">`;
	html = container.concat(html, '</div>');
	if (css.startsWith('<!DOCTYPE html>')) root.innerHTML = html;
	else root.innerHTML = html.concat('<style>\n', specifyCSS(css, component), '</style>');
	if (componentInitFunctions[component]) componentInitFunctions[component]();
};

handleLocation();

window.onpopstate = handleLocation;
window.route = route;

import { wait } from './utils/animations.js';

let handleLinkClick, handleLinkHover;
export function createLinkEvents(onClick, onHover) {
	handleLinkClick = function(event) {
		event.preventDefault();
		const href = event.currentTarget.href;
		if (href !== (document.location.href || document.location.href + '/')) {
			window.history.pushState(null, null, href);
			onClick();
		}
	}
	handleLinkHover = function(event) {
		onHover(new URL(event.target.href));
	}
}
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

const styleSheetMap = new Map();

export function addStyleSheet(name, styleSheet) {
	styleSheetMap.set(name, styleSheet);
	document.adoptedStyleSheets = Array.from(styleSheetMap.values());
	console.log(document.adoptedStyleSheets);
}

export async function loadCSS(filepath, callback) {
	const styleSheet = new CSSStyleSheet();
	const cssData = await fetch(filepath);
	const cssText = await cssData.text();
	styleSheet.replaceSync(cssText);


	// const debug = document.getElementById('debug');
	// const message = document.createElement('p');
	// message.style.color = 'white';
	// message.innerHTML = cssText;
	// debug.appendChild(message);
	// debug.appendChild(document.createElement('br'));

	if (callback) callback(styleSheet);
	addStyleSheet(filepath, styleSheet);
	return styleSheet;
}

// For loading HTML & CSS into a container and specifying it to that container

export function assignContainer(name) {
	const container = document.createElement('div');
	container.id = name + '-container';
	return container;
}

export async function insertHTML(filepath, destination, container) {
	const htmlData = await fetch(filepath);
	const htmlText = await htmlData.text();
	container.innerHTML = htmlText;
	destination.innerHTML = '';
	destination.appendChild(container);
}

function specifyCSSRule(styleSheet, selector, rule, index) {
	if (rule.selectorText) {
		const specifiedRule = selector + rule.cssText;
		styleSheet.deleteRule(index);
		styleSheet.insertRule(specifiedRule, index);
	}
}

function specifyCSS(styleSheet, selector) {
	const rules = styleSheet.cssRules;
	let i = 0;
	while (i < rules.length) {
		const rule = rules.item(i);
		if (rule instanceof CSSGroupingRule) { // for at-rules
			const subRules = rule.cssRules;
			let j = 0;
			while (j < subRules.length) {
				const subRule = subRules.item(j);
				specifyCSSRule(rule, selector, subRule, j);
				j++;
			}
		} else specifyCSSRule(styleSheet, selector, rule, i);
		i++;
	}
}

export async function insertCSS(filepath, container) {
	const selector = container.tagName.toLowerCase() + '#' + container.id + ' ';
	await loadCSS(filepath, styleSheet => specifyCSS(styleSheet, selector));
}

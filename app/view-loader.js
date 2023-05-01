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

export function assignContainer(name) {
	const container = document.createElement('div');
	container.id = name + '-container';
	return container;
}

export async function loadHTML(filepath, destination, container) {
	// const start = window.performance.now();
	const html = await fetch(filepath).then(data => data.text());
	// console.log('fetch took', window.performance.now() - start, 'ms');
	destination.innerHTML = '';
	destination.appendChild(container);
	container.innerHTML = html;
}

const styleSheetMap = new Map();

export async function loadCSS(filepath, container) {
	const styleSheet = new CSSStyleSheet();
	const css = await fetch(filepath).then(data => data.text());
	styleSheet.replaceSync(css);

	// Specify CSS to component container
	const selector = container.tagName.toLowerCase() + '#' + container.id + ' ';
	function replaceCSSRule(styleSheet, rule, index) {
		if (rule.selectorText) {
			const specifiedRule = selector + rule.cssText;
			styleSheet.deleteRule(index);
			styleSheet.insertRule(specifiedRule, index);
		}
	}

	const rules = styleSheet.cssRules;
	let i = 0;
	while (i < rules.length) {
		const rule = rules.item(i);
		if (rule instanceof CSSGroupingRule) { // for at-rules
			const subRules = rule.cssRules;
			let j = 0;
			while (j < subRules.length) {
				const subRule = subRules.item(j);
				replaceCSSRule(rule, subRule, j);
				j++;
			};
		} else replaceCSSRule(styleSheet, rule, i);
		i++;
	};

	styleSheetMap.set(container.id, styleSheet);
	document.adoptedStyleSheets = Array.from(styleSheetMap.values());
}

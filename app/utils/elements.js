export function forEachElement(HTMLCollection, callback) {
	const childCount = HTMLCollection.length;
	let i = 0;
	while (i < childCount) {
		callback(HTMLCollection[i], i);
		i++;
	}
}

const propertyMap = {
	top: 'offsetTop',
	left: 'offsetLeft'
};

export function getAbsoluteOffset(element, side) {
	const property = propertyMap[side];
	let offset = 0;

	do {
		offset += element[property];
		element = element.offsetParent;
	} while (element);

	return offset;
}

const styleSheetMap = new Map();

export function addStyleSheet(name, styleSheet) {
	styleSheetMap.set(name, styleSheet);
	document.adoptedStyleSheets = Array.from(styleSheetMap.values());
}

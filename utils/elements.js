// forEachElement(parent, (child, index) => {});
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

function getAbsoluteOffset(element, side) {
	const property = propertyMap[side];
	let offset = 0;

	do {
		offset += element[property];
		element = element.offsetParent;
	} while (element);

	return offset;
}

export const getAbsoluteX = element => getAbsoluteOffset(element, 'left');
export const getAbsoluteY = element => getAbsoluteOffset(element, 'top');

const header = document.getElementById('header');
export const getHeaderHeight = () => header.clientHeight;

export const bounded = 'max(var(--side-padding), calc((100vw - var(--max-width)) / 2))';

export { getScrollY, getVPW, getVPH } from './events.js';

// Inputs
export class ControlledInput {
	constructor(input, defaultValue = '') {
		this.input = input;
		this.setValue(defaultValue);
		input.oninput = event => this.setValue(event.target.value);
	}

	setValue(value) {
		this.input.value = value;
		this.value = value;
	}

	clear() {
		this.setValue('');
	}
}

export class ControlledForm {
	constructor(form) {
		this.inputs = new Map();

		this.onsubmit = () => {};
		form.onsubmit = event => {
			event.preventDefault();
			this.onsubmit();
		}
	}

	add(input, defaultValue) {
		const controlled = new ControlledInput(input, defaultValue);
		this.inputs.set(input.name, controlled);
		this[input.name] = controlled;
		return this;
	}

	getData() {
		const output = {};
		this.inputs.forEach((input, name) => output[name] = input.value);
		return output;
	}

	loadData(data) {
		for (const [key, value] of Object.entries(data)) {
			if (!this.inputs.has(key)) continue;
			const input = this.inputs.get(key);
			input.setValue(value);
		}
	}

	clear() {
		this.inputs.forEach(input => input.clear());
	}
}

// For debugging stuff on mobile
const debug = document.getElementById('debug');
export const setDebug = (innerHTML) => {
	debug.style.display = 'block';
	debug.innerHTML = innerHTML;
}

export async function intervalIterate(step, count, callback) {
	return new Promise(resolve => {
		let i = 0;
		const interval = setInterval(() => {
			callback(i);
			i++;
			if (i == count) {
				clearInterval(interval);
				resolve();
			}
		}, step);
	});
}

export class ScrollFadeInElement {
	constructor(element, offset = 0) {
		this.element = element;
		this.offset = offset;
		this.top = element.offsetTop;
		this.height = element.clientHeight;
		this.windowHeight = window.innerHeight;
	}

	onScroll(scrollY) {
		const beginning = this.top - this.windowHeight + this.offset;
		const halfway = this.top + this.height / 2 - this.windowHeight / 2;
		const opacity = (scrollY - beginning) / (halfway - beginning);
		this.element.style.opacity = opacity > 0 ? opacity.toString() : '0';
	}

	onResize() {
		this.top = this.element.offsetTop;
		this.height = this.element.clientHeight;
		this.windowHeight = window.innerHeight;
	}
}

export class AnimationManager {
	constructor(animation) {
		this.animation = animation;
		this.members = [];
		this.methodMap = new Map();
	}

	addElement(element) {
		const member = new this.animation(...arguments);
		this.members.push(member);
		const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(member));
		methodNames.forEach(name => {
			if (name !== 'constructor') {
				const method = member[name];

				// Groups all elements' handlers by name (e.x. onScroll)
				if (!this.methodMap.has(name))
					this.methodMap.set(name, []);
				this.methodMap.get(name).push(method.bind(member));

				// Add public method with the handler name (e.x. onScroll) that calls
				// each members' handler of the same name
				if (!this[name]) this[name] = args =>
					this.methodMap.get(name).forEach(method => method(args));
			}
		});
		return member;
	}

	forEach(callback) {
		this.members.forEach(member => callback(member));
	}
}

import { intervalIterate } from '../animations.js';

export const childrenFadeIn = {
	initializer: container => {
		for (const child of container.children)
			child.classList.add('children-fade-in', 'hidden');
	},
	options: {
		root: null,
		rootMargin: '-100px 0px 0px 0px',
		threshold: 0.5
	},
	run: container => {
		const count = container.children.length;
		intervalIterate(150, count, i => {
			const child = container.children.item(i);
			child.classList.replace('hidden', 'revealed');
		});
	}
}

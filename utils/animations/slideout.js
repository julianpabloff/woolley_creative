import { wait } from '../animations.js';
import { getAbsoluteX } from '../elements.js';

export const slideout = {
	initializer: element => {
		const x = getAbsoluteX(element);
		const width = element.clientWidth;
		const leftSide = x + width / 2 < window.innerWidth / 2;
		element.style.opacity = '0';
		element.dataset.side = leftSide ? 'left' : 'right';
	},
	options: {
		root: null,
		rootMargin: '-150px 0px -50px 0px',
		threshold: 0.5
	},
	run: async element => {
		const x = getAbsoluteX(element);
		const width = element.clientWidth;
		let offset;
		if (element.dataset.side == 'left') offset = 0 - x - width + 10;
		else if (element.dataset.side == 'right') offset = window.innerWidth - x - 10;
		element.style.transform = 'translateX(' + offset.toString() + 'px';

		// await wait(10);
		const transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s ease-in';
		const currentTransition = window.getComputedStyle(element).transition;
		element.style.transition = currentTransition.includes('all 0') ?
			transition : `${currentTransition}, ${transition}`;

		element.style.transform = 'translateX(0px)';
		if (element.style.opacity == '0') element.style.opacity = '1';

		setTimeout(() => element.style.transition = currentTransition, 1000);
	}
};

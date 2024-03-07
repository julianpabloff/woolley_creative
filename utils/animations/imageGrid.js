import { getScrollY } from '../elements.js';
import { ImageParallax } from './imageParallax.js';
import { ScrollFadeIn, ScrollFadeInGroup } from './scrollFadeIn.js';

export class ImageGrid {
	constructor(container, images, gap = '1.43rem') {
		container.classList.add('image-grid-container');
		container.style.setProperty('--image-grid-gap', gap);

		this.imageAnimations = [];

		for (const row of images) {
			const rowContainer = document.createElement('div');
			rowContainer.classList.add('image-grid-row');
			container.appendChild(rowContainer);

			let totalAspect = 0;
			for (const { width, height } of row) totalAspect += width / height;

			const count = row.length;
			for (let i = 0; i < count; i++) {
				const { src, width, height } = row[i];

				const imageContainer = document.createElement('div');
				const aspect = width / height;
				const percentage = aspect / totalAspect * 100;
				imageContainer.style.width =
					`calc(${percentage}% - (${gap} * (${count} - 1) / ${count}))`;
				imageContainer.style.aspectRatio = `${width} / ${height}`;
				imageContainer.style.opacity = '0';
				rowContainer.appendChild(imageContainer);

				const image = document.createElement('img');
				image.classList.add('w-100', 'h-100');
				image.src = src;
				imageContainer.appendChild(image);

				const parallax = new ImageParallax(imageContainer, src);
				this.imageAnimations.push(parallax);
			}

			const fadeInGroup = new ScrollFadeInGroup(rowContainer, {
				inPadding: 100,
				gridWidth: count,
				offset: 0.5,
				threshold: 0.4
			});
			this.imageAnimations.push(fadeInGroup);
		}
	}

	onScroll(scrollY = getScrollY()) {
		this.imageAnimations.forEach(animation => animation.onScroll(scrollY));
	}

	onResize() {
		this.imageAnimations.forEach(animation => animation.onResize());
	}
}


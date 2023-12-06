import { getAbsoluteY } from '../elements.js';

/* spriteSheetData
	container: [DOM element] The container to put a frame in
	filepath: [string] The filepath to the spritesheet image
	columns: [number] The amount of columns in the spritesheet image
	count: [number] The total amount of frames in the spritesheet image
	imgWidth: [number] The width of a frame on the spritesheet image
	imgHeight: [number] The height of a frame on the spritesheet image
*/

export class SpriteSheet {
	constructor(spriteSheetData) {
		const { container, filepath, columns, count, imgWidth, imgHeight } = spriteSheetData;
		for (const [key, value] of Object.entries(spriteSheetData)) this[key] = value;

		const frame = document.createElement('div');
		frame.style.aspectRatio = imgWidth.toString() + ' / ' + imgHeight.toString();
		frame.style.backgroundImage = 'url(' + filepath + ')';
		frame.style.backgroundSize = 'calc(100% * ' + columns + ')';
		frame.style.backgroundPosition = '0px 0px';

		this.frame = frame;
		this.index = 0;
		this.onResize();

		// container.innerHTML = '';
		container.classList.add('sprite-sheet-container');
		container.appendChild(frame);

	}

	toFrame(index) {
		const x = index % this.columns;
		const y = Math.floor(index / this.columns);
		const rows = Math.ceil(this.count / this.columns);
		this.frame.style.backgroundPositionX = `calc(100% * ${x} / ${this.columns - 1})`;
		this.frame.style.backgroundPositionY = `calc(100% * ${y} / ${rows - 1})`;
		this.index = index;
	}

	onResize() {
		this.y = getAbsoluteY(this.frame);
		this.height = this.frame.clientHeight;

		this.frame.className = 'frame';
		const landscape = this.container.clientWidth >= this.container.clientHeight;
		this.frame.className = landscape ? 'frame landscape' : 'frame portrait';
	}
}

export class SpriteSheetScroll {
	constructor(spriteSheetData, scrollYInterval = 50) {
		this.sprite = new SpriteSheet(spriteSheetData);
		this.interval = scrollYInterval;
	}

	onScroll(scrollY = window.scrollY) {
		const windowHeight = window.innerHeight;
		const spriteY = this.sprite.y;
		const spriteHeight = this.sprite.height;
		const header = 100; // moves center point down by half of this value

		const start = spriteY - windowHeight;
		const center = spriteY + (spriteHeight - windowHeight - header) / 2;
		const end = spriteY + spriteHeight - header;

		if (scrollY >= start && scrollY <= end) {
			let index = Math.floor((scrollY - center) / this.interval) % this.sprite.count;
			if (index < 0) index += this.sprite.count;
			if (index != this.sprite.index) this.sprite.toFrame(index);
		}
	}
	
	onResize() {
		this.sprite.onResize();
	}
}

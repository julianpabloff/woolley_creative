import { ScrollTracker } from '../../utils/animations.js';

const projectData = [
	{
		client: 'Ruffwear',
		description: 'Location product photography',
		image: '/assets/work/project_1.jpg',
		link: '/work/ruffwear'
	},
	{
		client: 'REI Co-op',
		description: 'Corporate mural photography',
		image: '/assets/work/project_2.jpg',
		link: '/work/rei-coop-mural'
	},
	{
		client: 'Sterling Rope',
		description: 'Location product photography',
		image: '/assets/work/project_3.jpg',
		link: '/work/sterling-rope'
	},
	{
		client: 'Sendline',
		description: 'Brand Strategy / Naming / Logo / Photography / Website / Collateral',
		image: '/assets/work/project_4.png',
		link: '/work/sendline'
	},
	{
		client: 'Oregon State University',
		description: 'Naming / Landing Page Design / Copywriting',
		image: '/assets/work/project_5.jpg',
		link: '/work/osu'
	},
	{
		client: 'Outdoor Industry Association',
		description: 'Naming / Logo / Photography / Landing Page Design',
		image: '/assets/work/project_6.jpg',
		link: '/work/the-leadership-lab'
	},
	{
		client: 'Halflight Photography',
		description: 'Studio Product + Lifestyle Photography',
		image: '/assets/work/project_7.jpg',
		link: '/work/halflight-photography'
	},
	{
		client: 'The Mountaineers Books',
		description: 'Environmental Photography',
		image: '/assets/work/project_8.jpg',
		link: '/work/mountaineers-book'
	},
	{
		client: 'REI Coop',
		description: 'Climb For A Cause Event Photography',
		image: '/assets/work/project_9.jpg',
		link: '/work/rei-coop-climb'
	},
];

function createProject(data, left) {
	// Container
	const container = document.createElement('a');
	container.className = `project ${left ? 'left' : 'right'} max-w-container`;
	container.href = data.link;

	// Text half
	const textContainer = document.createElement('div');
	textContainer.className = `max-w flex align-center${!left ? ' justify-end' : ''}`;

	const textBox = document.createElement('div');
	textBox.className = 'text';

	const h3 = document.createElement('h3');
	h3.innerText = data.client;

	const p = document.createElement('p');
	p.innerText = data.description;

	textBox.appendChild(h3);
	textBox.appendChild(p);
	textContainer.appendChild(textBox);

	// Image half
	const imageContainer = document.createElement('div');
	imageContainer.className = 'image';
	if (data.client == 'Sendline') imageContainer.classList.add('sendline');

	const image = document.createElement('img');
	image.src = data.image;
	image.alt = data.description;

	imageContainer.appendChild(image);

	// Final assembly
	if (left) {
		container.appendChild(textContainer);
		container.appendChild(imageContainer);
	} else {
		container.appendChild(imageContainer);
		container.appendChild(textContainer);
	}

	// Background wrapper
	const wrapper = document.createElement('div');
	wrapper.className = 'background-wrapper';

	wrapper.appendChild(container);

	return {
		element: wrapper,
		scrollElement: container
	};
}

export function addProjectsToContainer(container) {
	const updaters = [];
	let i = 0;
	projectData.forEach(data => {
		const left = i % 2 == 0;
		const { element, scrollElement } = createProject(data, left);

		container.appendChild(element);
		const tracker = new ScrollTracker(scrollElement);

		function onScroll(scrollY) {
			tracker.onScroll(scrollY);
			if (!tracker.visible) return;

			const displacement = 20 * tracker.t;
			const right = scrollElement.classList.contains('right');

			scrollElement.style.transform =
				`translate(${right ? '-' : ''}${displacement * 2}px, -${displacement}px)`;
		}

		function onResize() {
			tracker.onResize();
		}

		updaters.push({ onScroll, onResize });
		i++;
	});

	function onScroll(scrollY) {
		updaters.forEach(updater => updater.onScroll(scrollY));
	}

	function onResize() {
		const scrollY = window.scrollY;
		updaters.forEach(updater => {
			updater.onResize();
			updater.onScroll(scrollY);
		});
	}

	return { onScroll, onResize };
}

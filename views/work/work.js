import { LandingImage, ScrollTracker } from '../../utils/animations.js';
// import { addProjectsToContainer } from './projects.js';

export default function Work() {
	// Get DOM elements
	const landingContainer = document.getElementById('work-landing');
	// const projectsContainer = document.getElementById('work-projects');

	const landingImage = new LandingImage({
		container: landingContainer,
		bgFilepath: '/assets/work/landing_image_background.webp',
		heroText: ['We', 'Do', 'Creative.'],
		maxHeight: 900
	});

	// const updateProjects = addProjectsToContainer(projectsContainer);

	function onScroll() {
		const scrollY = window.scrollY;
		landingImage.onScroll(scrollY);
		// updateProjects.onScroll(scrollY);
	}

	function onResize() {
		landingImage.onResize();
		// updateProjects.onResize();
	}

	return { onScroll, onResize };
}

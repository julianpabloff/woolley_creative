import Home from '../views/home/home.js';
import Work from '../views/work/work.js';
import About from '../views/about/about.js';
import Careers from '../views/careers/careers.js';

export const routes = {
	'/': {
		selector: 'home',
		template: '/views/home/home.html',
		styles: '/views/home/home.css',
		initializer: Home
	},
	'/work': {
		selector: 'work',
		template: '/views/work/work.html',
		styles: '/views/work/work.css',
		initializer: Work
	},
		'/work/ruffwear': {
			selector: 'ruffwear',
			template: '/views/work/projects/ruffwear.html'
		},
	'/about': {
		selector: 'about',
		template: '/views/about/about.html',
		styles: '/views/about/about.css',
		initializer: About
	},
	'/careers': {
		selector: 'careers',
		template: '/views/careers/careers.html',
		styles: '/views/careers/careers.css',
		initializer: Careers
	}
}

const scrollHandlers = new Map();
const resizeHandlers = new Map();

// key enables having multiple handlers for the same event (i.e. index level and view level)
export default function addHandlers(key, handlers) {
	if (handlers.onScroll) scrollHandlers.set(key, handlers.onScroll);
	if (handlers.onResize) resizeHandlers.set(key, handlers.onResize);
}

let animations = [];
export const addAnimationToListeners = animation => animations.push(animation);
export const clearAnimationsFromListeners = () => animations = [];

function sendEventToHandlers(handlers, event) {
	handlers.forEach(handler => {
		handler(event);
	});
}

let scrollY = window.scrollY;
export const getScrollY = () => scrollY;

window.addEventListener('scroll', event => {
	scrollY = window.scrollY;
	sendEventToHandlers(scrollHandlers, event);
	animations.forEach(animation => animation.onScroll(scrollY));
});

let viewPortWidth = window.innerWidth;
let viewPortHeight = window.innerHeight;
export const getVPW = () => viewPortWidth;
export const getVPH = () => viewPortWidth;

window.addEventListener('resize', event => {
	viewPortWidth = window.innerWidth;
	viewPortHeight = window.innerHeight;
	sendEventToHandlers(resizeHandlers, event);
	animations.forEach(animation => animation.onResize());
});

const scrollHandlers = new Map();
const resizeHandlers = new Map();
const animations = [];

// key enables having multiple handlers for the same event (i.e. index level and view level)
export default function addHandlers(key, handlers) {
	if (handlers.onScroll) scrollHandlers.set(key, handlers.onScroll);
	if (handlers.onResize) resizeHandlers.set(key, handlers.onResize);
}

export const addAnimationToListeners = animation => animations.push(animation);

function sendEventToHandlers(handlers, event) {
	handlers.forEach(handler => {
		handler(event);
	});
}

window.addEventListener('scroll', event => {
	sendEventToHandlers(scrollHandlers, event);
	animations.forEach(animation => animation.onScroll(window.scrollY));
});

window.addEventListener('resize', event => {
	sendEventToHandlers(resizeHandlers, event);
	animations.forEach(animation => animation.onResize());
});

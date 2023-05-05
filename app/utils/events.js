const scrollHandlers = new Map();
const resizeHandlers = new Map();

function sendEventToHandlers(handlers, event) {
	handlers.forEach(handler => {
		handler(event);
	});
}

window.addEventListener('scroll', e => sendEventToHandlers(scrollHandlers, e));
window.addEventListener('resize', e => sendEventToHandlers(resizeHandlers, e))

// key enables having multiple handlers for the same event (i.e. index level and view level)
export default function addHandlers(key, handlers) {
	if (handlers.onScroll) scrollHandlers.set(key, handlers.onScroll);
	if (handlers.onResize) resizeHandlers.set(key, handlers.onResize);
}

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
export default function addHandlers(key, { onScroll, onResize }) {
	if (onScroll) scrollHandlers.set(key, onScroll);
	if (onResize) resizeHandlers.set(key, onResize);
}

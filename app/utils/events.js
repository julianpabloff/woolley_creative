const scrollHandlers = new Map();
const resizeHandlers = new Map();

function sendEventToHandlers(handlers, data) {
	handlers.forEach(handler => {
		handler(data);
	});
}

window.addEventListener('scroll', () => sendEventToHandlers(scrollHandlers, window.scrollY));

// key enables having multiple handlers for the same event (i.e. index level and view level)
export default function addHandlers(key, { onScroll, onResize }) {
	if (onScroll) scrollHandlers.set(key, onScroll);
	if (onResize) resizeHandlers.set(key, onResize);
}

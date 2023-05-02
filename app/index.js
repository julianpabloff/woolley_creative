export default function Index() {
	const headerBackground = document.getElementById('header-background');

	function onScroll(scrollY) {
		const threshold = 200;
		if (scrollY < threshold) {
			headerBackground.style.opacity = 1 - (threshold - scrollY) / threshold;
		}
		else headerBackground.style.opacity = '1';
	}

	return { onScroll };
}

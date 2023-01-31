window.addEventListener('load', function() {
	console.log('loaded');
	console.log(document);
	const mottoContainer = document.getElementById('motto-container');
	const mottoChildren = [];
	for (const child of mottoContainer.children) mottoChildren.push(child);
	console.log(mottoContainer);
	console.log(mottoChildren);

	const mottoOffset = 200;
	for (let i = 0; i < mottoChildren.length; i++) {
		const child = mottoChildren[i];
		setTimeout(() => {
			child.style.left = 0
			// child.style.opacity = 1;
		}, i * mottoOffset);
	}

	const mottoTransition = 'transform 1s cubic-bezier(0, 0.33, 0.07, 1.03)';
	setTimeout(() => mottoContainer.style.transition = mottoTransition, mottoOffset);

	function fadeMotto(scrollY) {
		console.log(scrollY);
		const displacement = scrollY * 0.7;
		mottoContainer.style.transform = 'translateY(' + displacement + 'px)';
		for (let i = 0; i < mottoChildren.length; i++) {
			const child = mottoChildren[i];
			const opacity = -(scrollY / (100 * i + 400)) + 1;
			child.style.opacity = opacity > 0 ? opacity : 0;
		}
	}
	document.addEventListener('scroll', event => {
		fadeMotto(window.scrollY);
	});
});

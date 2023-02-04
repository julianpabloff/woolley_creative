const HomeComponent = function(root) {
	this.name = 'home';
	console.log('running about comp');
	const header = document.getElementById('header');
	const headerHeight = header.clientHeight;
	const slideouts = createSlideoutsInContainer(document, headerHeight + 50, 50);
}

export default HomeComponent;

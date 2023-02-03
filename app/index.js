const homeLink = document.getElementById('home-link');
homeLink.addEventListener('click', e => route(e));

window.addEventListener('beforeunload', () => {
	localStorage.setItem('scrollpos', window.scrollY);
});

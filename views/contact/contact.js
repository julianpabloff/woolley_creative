export default function Contact() {
	// Get DOM elements
	const form = document.getElementById('contact-form');

	form.onsubmit = event => {
		event.preventDefault();
		const data = new FormData(form);
		console.log('FormData:', data);
	}
}

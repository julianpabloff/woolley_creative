export default function Contact() {
	// Get DOM elements
	const form = document.getElementById('contact-form');
	const submitButton = document.getElementById('submit-button');
	const successMessage = document.getElementById('success-message');

	function clearForm() {
		for (const element of form.elements) element.value = '';
	}

	function showSuccessMessage() {
		submitButton.style.display = 'none';
		successMessage.style.display = 'block';
		setTimeout(() => successMessage.style.opacity = '1', 10);
	}

	form.onsubmit = event => {
		event.preventDefault();
		const data = new FormData(form);
		console.log('FormData:', data);
		clearForm();
		showSuccessMessage();
	}
}

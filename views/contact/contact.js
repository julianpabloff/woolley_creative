import { forEachElement, setDebug, ControlledForm } from '../../utils/elements.js';

// TODO: use localStorage to maintain form content when page is refreshed
export default function Contact() {
	// Get DOM elements
	const formElement = document.getElementById('contact-form');
	const submitButton = document.getElementById('submit-button');
	const sendMessage = document.getElementById('send-message');

	function showSendMessage(message) {
		sendMessage.innerText = message;
		submitButton.style.display = 'none';
		sendMessage.style.display = 'block';
		setTimeout(() => sendMessage.style.opacity = '1', 10);
	}
	const successMessage = 'Thanks for reaching out to us! We\'ll be in touch shortly.';
	const errorMessage = 'There was a problem sending the email. Try again later.';

	const form = new ControlledForm(formElement);
	const saveForm = () => localStorage.setItem('contact-form', JSON.stringify(form.getData()));

	const fields = new Set(['email', 'firstname', 'lastname', 'company', 'phone', 'message']);
	forEachElement(formElement.elements, input => {
		if (fields.has(input.name)) form.add(input);
		input.onblur = () => saveForm(); // Save form when each input is filled out
	});

	const storedFormData = localStorage.getItem('contact-form');
	if (storedFormData) form.loadData(JSON.parse(storedFormData));

	setDebug('contact.js is being executed.');

	async function processEmailTemplate(formData) {
		const html = await fetch('/views/contact/confirmation-email.html');
		let htmlText = await html.text();
		fields.forEach(field => htmlText = htmlText.replaceAll(`%${field}%`, formData[field]));
		return htmlText;
	}

	async function sendConfirmationToWoolley() {
		const formData = form.getData();
		const { email, firstname, lastname } = formData;
		if (!email.length || !firstname.length || !lastname.length) return;

		const emailHTML = await processEmailTemplate(formData);
		const requestBody = {
			subject: `[${firstname} ${lastname}] Submitted Website Form`,
			content: emailHTML
		};

		const url = '/sendgrid.php';
		const response = await fetch(url, {
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
			body: JSON.stringify(requestBody)
		});
		const text = await response.text();

		if (text == 'success') {
			showSendMessage(successMessage);
			form.clear();
		} else showSendMessage(errorMessage);
	}

	form.onsubmit = sendConfirmationToWoolley;

	// Clear form when changing pages (or save data?)
	function onDestroy() {
		localStorage.setItem('contact-form', '{}');
		// saveForm();
	}

	return { onDestroy };
}

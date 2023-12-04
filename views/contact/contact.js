import { forEachElement, ControlledForm } from '../../utils/elements.js';

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
	const successMessage = 'Thanks for reaching out to us! We’ll be in touch shortly.';
	const errorMessage = 'There was a problem sending the email. Try again later.';

	const fields = new Set(['email', 'firstname', 'lastname', 'company', 'phone', 'message']);

	const form = new ControlledForm(formElement);
	forEachElement(formElement.elements, input => {
		if (fields.has(input.name)) form.add(input);
	});

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
		const woolleyAddress = 'thom@woolleycreative.com';

		const requestBody = {
			personalizations: [{
				to: [{ email: woolleyAddress }]
			}],
			from: woolleyAddress,
			subject: `[${firstname} ${lastname}] Submitted Website Form`,
			content: [{
				type: 'text/html',
				value: emailHTML
			}]
		};

		const url = '/api/email';
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(requestBody)
		});

		if (response.status == 200) showSendMessage(successMessage);
		else showSendMessage(errorMessage);
	}

	form.onsubmit = sendConfirmationToWoolley;
}

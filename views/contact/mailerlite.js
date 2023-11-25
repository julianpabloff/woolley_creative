export class MailerLite {
	constructor() {
		this.baseUrl = 'https://connect.mailerlite.com/';
		this.token = 'something';
		this.headers = new Headers();
		this.headers.append('Authorization', 'Bearer ' + this.token);
		this.headers.append('Content-Type', 'application/json');
	}

	async getSubs() {
		const parameters = {
			limit: 0
		};

		const urlParams = new URLSearchParams(parameters);
		const paramString = urlParams.size ? '?' + urlParams.toString() : '';

		const url = new URL(this.baseUrl + 'api/subscribers' + paramString);

		const response = await fetch(url, { headers: this.headers });
		const { data } = await response.json();
		console.log(data);
		
		return data;
	}

	async getSub(id) {
		const url = new URL(`api/subscribers/${id}`, this.baseUrl);

		const response = await fetch(url, { headers: this.headers });
		const { data } = await response.json();

		console.log(data);
		return data;
	}

	async createSub(formData) {
		const { email, firstname, lastname, company, phone, message } = formData;

		const body = {
			email,
			fields: {
				'name': firstname,
				'last_name': lastname,
				'company': company,
				'phone': phone
			},
			status: 'active'
		};

		const url = new URL('api/subscribers', this.baseUrl);

		const response = await fetch(url, {
			headers: this.headers,
			method: 'POST',
			body: JSON.stringify(body)
		});

		if (response.status == 201) {
			const { data } = await response.json();
			console.log(data);

			return data.id;
		}
		return '';
	}

	async deleteSub(id) {
		const url = new URL(`api/subscribers/${id}`, this.baseUrl);
		console.log(`deleting ${id} at ${url}`);

		const response = await fetch(url, {
			headers: this.headers,
			method: 'DELETE'
		});

		if (response.status == 204) console.log('successfully deleted');
		else console.log('there isn\'t a sub with that id.');
	}
}

export default class GateService {

	// refresh token call
    async refreshToken(token) {
        const res = await fetch(`https://email-trigger.alem.school/auth/refresh`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ jwt_token: token })
		});
		const r = await res.json();
		return r;
    }
}
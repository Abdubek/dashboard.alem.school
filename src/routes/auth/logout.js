export function post(req, res) {
	delete req.session.user;
	delete req.session.auth;
	delete req.session.roles;
	res.end(JSON.stringify({ ok: true }));
}

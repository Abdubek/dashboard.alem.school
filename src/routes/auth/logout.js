export function post(req, res) {
	delete req.session.user;
	delete req.session.auth;
	res.end(JSON.stringify({ ok: true }));
}

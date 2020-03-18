
export function post(req, res) {
    const user = req.body;

    req.session.user = user;
    
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(user));
}

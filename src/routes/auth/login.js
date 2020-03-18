import {parseJwt} from '../../tools/auth'; 

function isAuthorized(session) {
    if (session == null || session.user == null || !('jwt_token' in session.user)) {
        return false;
    }
    let jwt = session.user.jwt_token;
    if (jwt) {
        let result = parseJwt(jwt);
        const auth = result['https://hasura.io/jwt/claims']['x-hasura-user-id'];
        if (auth != null) {
            return true;
        }
    }
    return false;
}

// getRoles returns roles in from jwt object
function getRoles(session) {
    let roles = [];
    if (session.user == null || !('jwt_token' in session.user)) {
        return roles;
    }
    let jwt = session.user.jwt_token;
    if (jwt) {
        let result = parseJwt(jwt);
        roles = result['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'];
    }
    return roles;
}

export function post(req, res) {
    const user = req.body;

    req.session.user = user;
    req.session.auth = isAuthorized(req.session);
    req.session.roles = getRoles(req.session);
    
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(user));
}

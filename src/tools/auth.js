// contains functions related to authorization

import GateService from '../services/GateService';

const gateService = new GateService();

// parseJwt returns decoded object inside jwt
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

// getRoles returns roles in from jwt object
export function getRoles() {
    let roles = [];
    if (process.browser) {
        let jwt = localStorage.getItem('jwt_token');
        if (jwt) {
            let result = parseJwt(jwt);
            roles = result['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'];
        }
    }
    return roles;
}

// customFetch is main function to call fetch to api.alem.school
// if api returns 401 (Unauthorized) then it tries to refresh token
// if refresh is impossible (invalid token) then commits logout
export function customFetch(url, data={}) {
    if (!process.browser || localStorage.getItem('jwt_token') == null) {
        window.location.replace('/logout');
        return
    }
    const jwtToken = localStorage.getItem('jwt_token');
    let fetchPromise = fetch(url, {
        ...data,
        headers: {'Authorization':jwtToken}
    }).then(resp => {
        console.log(resp);
        if (resp.status == 401) {
            // try to refresh token
            // otherwise make logout and redirect to /logout
            gateService.refreshToken(jwtToken).then(refreshData => {
                if (refreshData['status'] == 300) {
                    window.location.replace('/logout');
                } else if ('jwt_token' in refreshData) {
                    localStorage.setItem('jwt_token', refreshData['jwt_token'])
                }
            });
        } else if (!resp.ok) {
            throw new Error(resp.statusText);
        }
        return resp;
    }).catch(err => {
        console.log('Error customFetch: ', err);
    });
    return fetchPromise;
}

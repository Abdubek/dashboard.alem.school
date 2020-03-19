// contains functions related to authorization
import atob from 'atob';
import { goto } from '@sapper/app';
import { post } from 'utils.js';

// parseJwt returns decoded object inside jwt
export function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};
export function getRoles () {
    
}
// customFetch is main function to call fetch to api.alem.school
// if api returns 401 (Unauthorized) then it tries to refresh token
// if refresh is impossible (invalid token) then commits logout
export function customFetch(url, jwt_token, data={}) {
    let fetchPromise = fetch(url, {
        ...data,
        headers: {'Authorization':jwt_token}
    }).then(resp => {
        if (resp.status == 401) {
            // try to refresh token
            // otherwise make logout and redirect to /logout
            post(`auth/refresh`, {'jwt_token': jwt_token}).then(resp => {
                if (resp.status == 200) {
                    $session.user.jwt_token = refreshData['jwt_token']
                } else {
                    goto('/logout');
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

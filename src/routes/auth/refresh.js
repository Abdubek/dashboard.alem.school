import GateService from '../services/GateService';

const gateService = new GateService();

export function post(req, res) {
    const jwt_token = req.body['jwt_token'];
    let response = {'status': 200};

    gateService.refreshToken(jwt_token).then(refreshData => {
        if (refreshData['status'] == 300) {
            response.status = 300;
        } else if ('jwt_token' in refreshData) {
            req.session.user.jwt_token = refreshData['jwt_token'];
            response['jwt_token'] = refreshData['jwt_token'];
        }
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}

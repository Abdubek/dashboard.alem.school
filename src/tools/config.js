// config.js contains env variables for stages:
// - development
// - production

const prod = {
    URL: `https://dashboard.alem.school`,
    API_URL: `https://api.alem.school`,
    AUTH_URL: `https://email-trigger.alem.school/auth/dashboard`,
    CLIENT_ID: `d02ae1b0-9b05-4b24-ad87-1ef2a9ea2559`,
}

const dev = {
    URL: `http://localhost:3000`,
    API_URL: `https://api.alem.school`,
    AUTH_URL: `https://email-trigger.alem.school/auth/dashboard_test`,
    CLIENT_ID: `f3304387-faf9-46bf-9bd6-8e0992400cbd`
}

var config = process.env.NODE_ENV === 'development' ? dev : prod;

export default config;
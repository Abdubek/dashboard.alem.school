import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import bodyParser from 'body-parser';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import * as sapper from '@sapper/server';

const FileStore = sessionFileStore(session);

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
polka()
	.use(bodyParser.json())
	.use(session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 31536000,
			secure:  process.env.NODE_ENV === 'development' ? false : true
		},
		store: new FileStore({
			path: process.env.NOW ? `/tmp/sessions` : `.sessions`
		})
	}))
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware({
			session: req => ({
				user: req.session && req.session.user,
				auth: req.session && req.session.auth,
				roles: req.session && req.session.roles
			})
		})
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});

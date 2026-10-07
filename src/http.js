const fastify = require('fastify')({ trustProxy: process.env.HTTP_TRUST_PROXY === 'true' });
const { short } = require('leeks.js');
const { join } = require('path');
const { files } = require('node-dir');
const { getPrivilegeLevel } = require('./lib/users');
const { format } = require('util');

process.env.ORIGIN = process.env.HTTP_INTERNAL || process.env.HTTP_EXTERNAL;

module.exports = async client => {
	// for file uploads
	fastify.register(require('@fastify/multipart'), { limits: { fileSize: 2 ** 27 } }); // 128 MiB

	// cookies plugin, must be registered before oauth2 since oauth2@7.2.0
	fastify.register(require('@fastify/cookie'));

	// jwt plugin
	fastify.register(require('@fastify/jwt'), {
		cookie: {
			cookieName: 'token',
			signed: false,
		},
		secret: process.env.ENCRYPTION_KEY,
	});

	// Activate Sentry if SENTRY_DNS is set
	if (process.env.SENTRY_DSN) {
		const Sentry = require('@sentry/node');
		Sentry.setupFastifyErrorHandler(fastify);
	}

	// auth
	fastify.decorate('authenticate', async (req, res) => {
		try {
			const adminSecret = req.headers['x-admin-secret'] || (req.body && req.body.adminSecret);
			if (adminSecret && adminSecret === process.env.DISCORD_SECRET) {
				req.user = { id: process.env.SUPER || client.user.id, username: 'Administrator' };
				return;
			}
			const data = await req.jwtVerify();
			if (data.expiresAt < Date.now()) throw 'expired';
			if (data.createdAt < new Date(process.env.INVALIDATE_TOKENS).getTime()) throw 'expired';
		} catch (error) {
			return res.code(401).send({
				error: 'Unauthorised',
				message: error === 'expired' ? 'Your token has expired; please re-authenticate.' : 'You are not authenticated.',
				statusCode: 401,
			});
		}
	});

	fastify.decorate('isMember', async (req, res) => {
		try {
			const adminSecret = req.headers['x-admin-secret'] || (req.body && req.body.adminSecret);
			if (adminSecret && adminSecret === process.env.DISCORD_SECRET) {
				return;
			}
			const userId = req.user.id;
			const guildId = req.params.guild;
			const guild = client.guilds.cache.get(guildId);
			if (!guild) {
				return res.code(404).send({
					error: 'Not Found',
					message: 'The requested resource could not be found.',
					statusCode: 404,
				});
			}
			const guildMember = await guild.members.fetch(userId).catch(() => null);
			if (!guildMember) {
				return res.code(403).send({
					error: 'Forbidden',
					message: 'You are not permitted for this action.',
					statusCode: 403,
				});
			}
		} catch (err) {
			res.send(err);
		}
	});

	fastify.decorate('isAdmin', async (req, res) => {
		try {
			const adminSecret = req.headers['x-admin-secret'] || (req.body && req.body.adminSecret);
			if (adminSecret && adminSecret === process.env.DISCORD_SECRET) {
				return;
			}
			const userId = req.user?.id;
			if (client.supers?.includes(userId)) {
				return;
			}
			const guildId = req.params.guild;
			const guild = client.guilds.cache.get(guildId);
			if (!guild) {
				return res.code(404).send({
					error: 'Not Found',
					message: 'The requested resource could not be found.',
					statusCode: 404,
				});
			}
			if (client.banned_guilds.has(guildId)) {
				return res.code(451).send({
					error: 'Unavailable For Legal Reasons',
					message: 'This guild has been banned for breaking the terms of service.',
					statusCode: 451,
				});
			}
			const guildMember = await guild.members.fetch(userId).catch(() => null);
			if (guildMember && (guildMember.permissions.has('Administrator') || guildMember.permissions.has('ManageGuild'))) {
				return;
			}
			const isAdmin = guildMember && await getPrivilegeLevel(guildMember) >= 2;
			if (!isAdmin) {
				return res.code(403).send({
					error: 'Forbidden',
					message: 'You are not permitted for this action.',
					statusCode: 403,
				});
			}
		} catch (err) {
			res.send(err);
		}
	});

	// body processing
	fastify.addHook('preHandler', (req, res, done) => {
		if (req.body && typeof req.body === 'object') {
			for (const prop in req.body) {
				if (typeof req.body[prop] === 'string') {
					req.body[prop] = req.body[prop].trim();
				}
			}
		}
		done();
	});

	// logging
	fastify.addHook('onResponse', (req, res, done) => {
		done();
		const status = (res.statusCode >= 500
			? '&4'
			: res.statusCode >= 400
				? '&6'
				: res.statusCode >= 300
					? '&3'
					: res.statusCode >= 200
						? '&2'
						: '&f') + res.statusCode;
		let responseTime = res.elapsedTime.toFixed(2);
		responseTime = (responseTime >= 100
			? '&c'
			: responseTime >= 10
				? '&e'
				: '&a') + responseTime + 'ms';
		const level = req.routeOptions.url === '/status'
			? 'debug'
			: req.routeOptions.url === '/*'
				? 'verbose'
				: 'info';
		client.log[level].http(
			format(
				short(`${req.id} ${req.ip} ${req.method} %s &m-+>&r ${status}&b in ${responseTime}`),
				req.url,
			),
		);
		done();
	});

	fastify.addHook('onError', async (req, res, err) => client.log.error.http(req.id, err));

	// route loading
	const dir = join(__dirname, '/routes');
	files(dir, {
		exclude: /^\./,
		match: /.js$/,
		sync: true,
	}).forEach(file => {
		const path = file
			.substring(0, file.length - 3) // remove `.js`
			.substring(dir.length) // remove higher directories
			.replace(/\\/g, '/') // replace `\` with `/` because Windows is stupid
			.replace(/\[(\w+)\]/gi, ':$1') // convert [] to :
			.replace('/index', '') || '/'; // remove index
		const route = require(file);

		Object.keys(route).forEach(method => fastify.route({
			config: { client },
			method: method.toUpperCase(),
			path,
			...route[method](fastify),
		})); // register route
	});

	const fs = require('fs');
	const renderDashboard = require('./views/dashboard');

	// Static Assets: Favicon
	fastify.get('/favicon.png', (req, res) => {
		const favPath = join(__dirname, '../assets/favicon.png');
		if (fs.existsSync(favPath)) {
			res.header('Content-Type', 'image/png');
			return res.send(fs.readFileSync(favPath));
		}
		res.code(404).send('Not Found');
	});

	// Static Assets: Images / Wordmarks
	fastify.get('/assets/:file', (req, res) => {
		const file = (req.params.file || '').replace(/[^a-zA-Z0-9._-]/g, '');
		const assetPath = join(__dirname, '../assets', file);
		if (fs.existsSync(assetPath)) {
			const mime = file.endsWith('.png') ? 'image/png' : file.endsWith('.webp') ? 'image/webp' : file.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream';
			res.header('Content-Type', mime);
			return res.send(fs.readFileSync(assetPath));
		}
		res.code(404).send('Not Found');
	});

	// Master Aerix Tickets Dashboard
	fastify.all('/*', (req, res) => {
		return renderDashboard(req, res, client);
	});

	// start the fastify server
	fastify.listen({
		host: process.env.HTTP_HOST,
		port: process.env.HTTP_PORT,
	}, (err, addr) => {
		if (err) {
			client.log.error.http(err);
		} else {
			client.log.success.http(`Listening at ${addr}`);
		}
	});
};

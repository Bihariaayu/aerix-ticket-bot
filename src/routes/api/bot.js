const fs = require('fs');
const { join } = require('path');
const YAML = require('yaml');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import("../../client")} */
		const client = req.routeOptions.config.client;

		let appDescription = '';
		try {
			const appRes = await fetch('https://discord.com/api/v10/applications/@me', {
				headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
			});
			if (appRes.ok) {
				const appData = await appRes.json();
				appDescription = appData.description || '';
			}
		} catch {
			appDescription = '';
		}

		let totalMembers = 0;
		client.guilds.cache.forEach(g => {
			totalMembers += g.memberCount || 0;
		});

		let userAuthorized = false;
		try {
			const data = await req.jwtVerify();
			if (data && data.expiresAt >= Date.now()) {
				req.user = data;
			}
		} catch {}

		if (req.user) {
			const isSuper = client.supers?.includes(req.user.id) || !process.env.SUPER;
			if (isSuper) {
				userAuthorized = true;
			} else {
				for (const [, guild] of client.guilds.cache) {
					try {
						const member = guild.members.cache.get(req.user.id) || await guild.members.fetch(req.user.id).catch(() => null);
						if (member && (member.permissions.has('Administrator') || member.permissions.has('ManageGuild'))) {
							userAuthorized = true;
							break;
						}
					} catch {}
				}
			}
		}

		return res.send({
			authorized: userAuthorized,
			bot: {
				avatar: client.user.displayAvatarURL({ extension: 'png', size: 256 }),
				description: appDescription,
				discriminator: client.user.discriminator,
				id: client.user.id,
				tag: client.user.tag,
				username: client.user.username,
			},
			config: {
				activities: client.config.presence?.activities || [],
				interval: client.config.presence?.interval || 20,
				status: client.config.presence?.status || 'online',
			},
			stats: {
				guilds: client.guilds.cache.size,
				members: totalMembers,
				ping: client.ws.ping,
				uptime: Math.floor(process.uptime()),
			},
			user: req.user ? {
				avatar: req.user.avatar,
				id: req.user.id,
				username: req.user.username,
			} : null,
		});
	},
});

module.exports.post = fastify => ({
	handler: async (req, res) => {
		/** @type {import("../../client")} */
		const client = req.routeOptions.config.client;
		const warnings = [];

		// Try JWT verification
		try {
			const data = await req.jwtVerify();
			if (data && data.expiresAt >= Date.now()) {
				req.user = data;
			}
		} catch {}

		// Authorization Check
		let isAuthorized = false;
		const adminSecret = req.headers['x-admin-secret'] || req.body?.adminSecret;
		if (adminSecret && adminSecret === process.env.DISCORD_SECRET) {
			isAuthorized = true;
		} else if (req.user) {
			if (client.supers?.includes(req.user.id) || !process.env.SUPER) {
				isAuthorized = true;
			} else {
				for (const [, guild] of client.guilds.cache) {
					try {
						const member = guild.members.cache.get(req.user.id) || await guild.members.fetch(req.user.id).catch(() => null);
						if (member && (member.permissions.has('Administrator') || member.permissions.has('ManageGuild'))) {
							isAuthorized = true;
							break;
						}
					} catch {}
				}
			}
		}

		if (!isAuthorized) {
			return res.code(403).send({
				error: 'Forbidden',
				message: 'You are not authorized to customize the Aerix Ticket bot. Administrator permissions required. Please log in with Discord.',
				statusCode: 403,
			});
		}

		const {
			activities,
			avatar,
			description,
			interval,
			status,
			username,
		} = req.body || {};

		// 1. Update Description / Bio (Discord Application)
		if (typeof description === 'string') {
			try {
				const appRes = await fetch('https://discord.com/api/v10/applications/@me', {
					body: JSON.stringify({ description }),
					headers: {
						Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
						'Content-Type': 'application/json',
					},
					method: 'PATCH',
				});
				if (!appRes.ok) {
					const errText = await appRes.text();
					warnings.push(`Discord Application bio update failed: ${errText}`);
				}
			} catch (err) {
				warnings.push(`Failed to update application description: ${err.message}`);
			}
		}

		// 2. Update Username
		if (typeof username === 'string' && username.trim() && username.trim() !== client.user.username) {
			try {
				await client.user.setUsername(username.trim());
			} catch (err) {
				warnings.push(`Username rate limited by Discord (max 2 changes per 2 hours): ${err.message}`);
			}
		}

		// 3. Update Avatar / Profile Picture
		if (typeof avatar === 'string' && avatar.trim()) {
			try {
				let buffer = null;
				if (avatar.startsWith('data:')) {
					const base64Data = avatar.split(';base64,').pop();
					buffer = Buffer.from(base64Data, 'base64');
				} else if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
					const fetchRes = await fetch(avatar);
					if (fetchRes.ok) {
						const ab = await fetchRes.arrayBuffer();
						buffer = Buffer.from(ab);
					} else {
						warnings.push('Failed to download avatar from specified URL.');
					}
				}

				if (buffer) {
					await client.user.setAvatar(buffer);
				}
			} catch (err) {
				warnings.push(`Avatar update failed: ${err.message}`);
			}
		}

		// 4. Update Status & Activities
		if (!client.config.presence) {
			client.config.presence = {};
		}

		if (status && ['dnd', 'idle', 'invisible', 'online'].includes(status)) {
			client.config.presence.status = status;
		}

		if (typeof interval === 'number' && interval >= 5) {
			client.config.presence.interval = interval;
		}

		if (Array.isArray(activities)) {
			client.config.presence.activities = activities.map(act => ({
				name: String(act.name || '').trim(),
				type: Number(act.type ?? 0),
				...(act.url ? { url: String(act.url).trim() } : {}),
			})).filter(act => act.name.length > 0);
		}

		// Refresh presence live
		if (typeof client.refreshPresence === 'function') {
			await client.refreshPresence();
		}

		// 5. Persist to user/config.yml and src/user/config.yml
		try {
			const configPaths = ['./user/config.yml', join(__dirname, '../../user/config.yml')];
			for (const p of configPaths) {
				if (fs.existsSync(p)) {
					const existing = YAML.parse(fs.readFileSync(p, 'utf8')) || {};
					existing.presence = client.config.presence;
					fs.writeFileSync(p, YAML.stringify(existing), 'utf8');
				}
			}
		} catch (err) {
			warnings.push(`Failed to write config.yml persistence: ${err.message}`);
		}

		return res.send({
			bot: {
				avatar: client.user.displayAvatarURL({ extension: 'png', size: 256 }),
				discriminator: client.user.discriminator,
				id: client.user.id,
				tag: client.user.tag,
				username: client.user.username,
			},
			message: 'Aerix Tickets bot configuration updated successfully',
			success: true,
			warnings: warnings.length > 0 ? warnings : undefined,
		});
	},
	onRequest: async (req, res) => {
		const adminSecret = req.headers['x-admin-secret'] || (req.body && req.body.adminSecret);
		if (adminSecret && adminSecret === process.env.DISCORD_SECRET) {
			return;
		}
		return await fastify.authenticate(req, res);
	},
});

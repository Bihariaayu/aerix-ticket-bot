module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
		const id = req.params.guild;
		let guild = client.guilds.cache.get(id);
		if (!guild) {
			try {
				guild = await client.guilds.fetch(id);
			} catch (_) {
				return res.code(404).send({
					error: 'Not Found',
					message: 'Guild not found in bot cache.',
					statusCode: 404,
				});
			}
		}

		const { query } = req.query;
		switch (query) {
		case 'channels.cache':
			return Array.from(guild.channels.cache.values()).map(c => ({
				id: c.id,
				name: c.name,
				parentId: c.parentId,
				rawPosition: c.rawPosition,
				type: c.type,
			}));
		case 'roles.cache':
			return Array.from(guild.roles.cache.values()).map(r => ({
				color: r.color,
				id: r.id,
				managed: r.managed,
				name: r.name,
				position: r.position,
			}));
		default:
			return res.code(400).send({
				error: 'Bad Request',
				message: 'Invalid query parameter.',
				statusCode: 400,
			});
		}
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

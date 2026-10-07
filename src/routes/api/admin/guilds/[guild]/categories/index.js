const { logAdminEvent } = require('../../../../../../lib/logging');
const { updateStaffRoles } = require('../../../../../../lib/users');
const emoji = require('node-emoji');
const {
	ApplicationCommandPermissionType,
	ChannelType: { GuildCategory },
} = require('discord.js');
const ms = require('ms');
const {
	getAverageTimes, getAverageRating,
} = require('../../../../../../lib/stats');

module.exports.get = fastify => ({
	handler: async req => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;

		let { categories } = await client.prisma.guild.findUnique({
			select: {
				categories: {
					select: {
						channelName: true,
						claiming: true,
						createdAt: true,
						description: true,
						discordCategory: true,
						emoji: true,
						enableFeedback: true,
						id: true,
						image: true,
						name: true,
						openingMessage: true,
						ticketCreatedMessage: true,
						notifyStaffMessage: true,
						embedTitle: true,
						embedColor: true,
						embedNotice: true,
						embedFooter: true,
						autoCloseMinutes: true,
						questions: {
							orderBy: { order: 'asc' },
							select: {
								id: true,
								label: true,
								maxLength: true,
								minLength: true,
								options: true,
								order: true,
								placeholder: true,
								required: true,
								style: true,
								type: true,
							},
						},
						requiredRoles: true,
						staffRoles: true,
						tickets: {
							select: {
								closedAt: true,
								createdAt: true,
							    feedback: { select: { rating: true } },
								firstResponseAt: true,
							},
							where: {
								firstResponseAt: { not: null },
								open: false,
							},
						},
					},
				},
			},
			where: { id: req.params.guild },
		});

		categories = await Promise.all(
			categories.map(async category => {
				const {
					avgResolutionTime,
					avgResponseTime,
				} = await getAverageTimes(category.tickets);
				const avgRating = await getAverageRating(category.tickets);
				category = {
					...category,
					stats: {
						avgRating: avgRating.toFixed(1),
						avgResolutionTime: ms(avgResolutionTime),
						avgResponseTime: ms(avgResponseTime),
					},
				};
				delete category.tickets;
				return category;
			}),
		);

		return categories;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

module.exports.post = fastify => ({
	handler: async req => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;

		const user = await client.users.fetch(req.user.id);
		const guild = client.guilds.cache.get(req.params.guild);
		const data = req.body || {};
		data.staffRoles = Array.isArray(data.staffRoles) ? data.staffRoles : [];
		data.emoji = typeof data.emoji === 'string' ? data.emoji : '';
		data.openingMessage = data.openingMessage || 'Thank you for contacting Aerix Tickets support. A staff member will be with you shortly.';
		data.description = data.description || 'Support department';
		const allow = ['ViewChannel', 'ReadMessageHistory', 'SendMessages', 'EmbedLinks', 'AttachFiles'];

		if (!data.discordCategory) {
			let name = data.name;
			if (emoji.hasEmoji(data.emoji)) name = `${emoji.get(data.emoji)} ${name}`;
			const channel = await guild.channels.create({
				name,
				permissionOverwrites: [
					...[
						{
							deny: ['ViewChannel'],
							id: guild.roles.everyone,
						},
						{
							allow: allow,
							id: client.user.id,
						},
					],
					...data.staffRoles.map(id => ({
						allow: allow,
						id,
					})),
				],
				position: 1,
				reason: `Tickets category created by ${user.tag}`,
				type: GuildCategory,
			});
			data.discordCategory = channel.id;
		}

		data.channelName ||= 'ticket-{num}'; // not ??=, expect empty string
		if (data.autoCloseMinutes !== undefined) {
			data.autoCloseMinutes = (data.autoCloseMinutes === null || data.autoCloseMinutes === '') ? null : Number(data.autoCloseMinutes);
		}

		const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
		delete data.questions;

		const category = await client.prisma.category.create({
			data: {
				...data,
				guild: { connect: { id: guild.id } },
				questions: {
					create: rawQuestions.map((q, idx) => ({
						label: q.label,
						placeholder: q.placeholder || '',
						required: q.required !== false,
						style: Number(q.style) || (q.type === 'PARAGRAPH' ? 2 : 1),
						type: q.type || (q.style === 1 ? 'SHORT' : 'PARAGRAPH'),
						options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
						order: idx,
						minLength: Number(q.minLength) || 0,
						maxLength: Number(q.maxLength) || 1000,
					})),
				},
			},
		});

		// update caches
		await client.tickets.getCategory(category.id, true);
		await updateStaffRoles(guild);

		if (req.user.accessToken) {
			Promise.all([
				'Create ticket for user',
				'claim',
				'force-close',
				'move',
				'priority',
				'release',
			].map(name =>
				client.application.commands.permissions.set({
					command: client.application.commands.cache.find(cmd => cmd.name === name),
					guild,
					permissions: [
						{
							id: guild.id, // @everyone
							permission: false,
							type: ApplicationCommandPermissionType.Role,
						},
						...category.staffRoles.map(id => ({
							id,
							permission: true,
							type: ApplicationCommandPermissionType.Role,
						})),
					],
					token: req.user.accessToken,
				}),
			))
				.then(() => client.log.success('Updated application command permissions in "%s"', guild.name))
				.catch(error => client.log.error(error));
		}

		logAdminEvent(client, {
			action: 'create',
			guildId: guild.id,
			target: {
				id: category.id,
				name: category.name,
				type: 'category',
			},
			userId: req.user.id,
		});

		return category;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

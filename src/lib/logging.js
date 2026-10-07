const {
	cleanCodeBlockContent,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	AttachmentBuilder,
} = require('discord.js');
const { diff: getDiff } = require('object-diffy');
const ShortUniqueId = require('short-unique-id');
const ms = require('ms');
const { pools } = require('./threads');
const { crypto } = pools;

const uid = new ShortUniqueId();

const getSUID = () => uid.stamp(10);

const uuidRegex = /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/g;

const exists = thing => typeof thing === 'string' ? thing.length > 0 : thing !== null && thing !== undefined;

const arrToObj = obj => {
	for (const key in obj) {
		if (obj[key] instanceof Array && obj[key][0]?.id) {
			const temp = {};
			obj[key].forEach(v => (temp[v.id] = v));
			obj[key] = temp;
		}
	}
	return obj;
};

function makeDiff({
	original, updated,
}) {
	const diff = getDiff(arrToObj(original), arrToObj(updated));
	const fields = [];
	for (const key in diff) {
		if (key === 'createdAt') continue; // object-diffy doesn't like dates
		const from = exists(diff[key].from) ? `- ${String(diff[key].from).replace(/\n/g, '\\n')}\n` : '';
		const to = exists(diff[key].to) ? `+ ${String(diff[key].to).replace(/\n/g, '\\n')}\n` : '';
		fields.push({
			inline: true,
			name: key.replace(uuidRegex, $1 => $1.split('-')[0]),
			value: `\`\`\`diff\n${cleanCodeBlockContent(from + to)}\n\`\`\``,
		});
	}
	return fields;
}

/**
 * @param {import("client")} client
 * @param {string} guildId
 * @returns {import("discord.js").TextChannel?}
*/
async function getLogChannel(client, guildId) {
	const { logChannel: channelId } = await client.prisma.guild.findUnique({
		select: { logChannel: true },
		where: { id: guildId },
	});
	return channelId && client.channels.cache.get(channelId);
}

/**
 * @param {import("client")} client
 * @param {object} details
 * @param {string} details.guildId
 * @param {string} details.userId
 * @param {string} details.action
*/
async function logAdminEvent(client, {
	guildId, userId, action, target, diff,
}) {
	const settings = await client.prisma.guild.findUnique({
		select: {
			footer: true,
			locale: true,
			logChannel: true,
		},
		where: { id: guildId },
	});
	/** @type {import("discord.js").Guild} */
	const guild = client.guilds.cache.get(guildId);
	const member = await guild.members.fetch(userId).catch(() => null);
	const userTag = member?.user?.tag || `User ${userId}`;
	client.log.info.settings(`${userTag} ${action}d ${target.type} ${target.id}`);
	if (!settings.logChannel) return;
	const colour = action === 'create'
		? 'Green' : action === 'update'
			? 'Orange' : action === 'delete'
				? 'Red' : 'Default';
	const getMessage = client.i18n.getLocale(settings.locale);
	const i18nOptions = {
		user: member ? `<@${member.user.id}>` : `\`${userId}\``,
		verb: getMessage(`log.admin.verb.${action}`),
	};
	const channel = client.channels.cache.get(settings.logChannel);
	if (!channel) return;
	const embeds = [
		new EmbedBuilder()
			.setColor(colour)
			.setAuthor({
				iconURL: member.displayAvatarURL(),
				name: member.displayName,
			})
			.setTitle(getMessage('log.admin.title.joined', {
				...i18nOptions,
				targetType: getMessage(`log.admin.title.target.${target.type}`),
				verb: getMessage(`log.admin.verb.${action}`),
			}))
			.setDescription(getMessage('log.admin.description.joined', {
				...i18nOptions,
				targetType: getMessage(`log.admin.description.target.${target.type}`),
				verb: getMessage(`log.admin.verb.${action}`),
			}))
			.addFields([
				{
					name: getMessage(`log.admin.title.target.${target.type}`),
					value: target.name ? `${target.name} (\`${target.id}\`)` : target.id,
				},
			]),
	];

	if (diff?.original && Object.entries(makeDiff(diff)).length) {
		embeds.push(
			new EmbedBuilder()
				.setColor(colour)
				.setTitle(getMessage('log.admin.changes'))
				.setFields(makeDiff(diff)),
		);
	}

	return await channel.send({ embeds });
}

/**
 * Generate transcript file attachment for ticket log
 * @param {import("client")} client
 * @param {string} ticketId
 * @returns {Promise<AttachmentBuilder|null>}
 */
async function buildTranscriptAttachment(client, ticketId) {
	try {
		const fullTicket = await client.prisma.ticket.findUnique({
			include: {
				archivedChannels: true,
				archivedMessages: {
					orderBy: { createdAt: 'asc' },
					where: { external: false },
				},
				archivedRoles: true,
				archivedUsers: true,
				category: true,
				claimedBy: true,
				closedBy: true,
				createdBy: true,
				feedback: true,
				guild: true,
				questionAnswers: { include: { question: true } },
			},
			where: { id: ticketId },
		});

		if (!fullTicket) return null;

		fullTicket.archivedChannels ||= [];
		fullTicket.archivedMessages ||= [];
		fullTicket.archivedRoles ||= [];
		fullTicket.archivedUsers ||= [];
		fullTicket.questionAnswers ||= [];
		fullTicket.pinnedMessageIds ||= [];

		if (!fullTicket.category) {
			fullTicket.category = { channelName: 'ticket-{num}', name: 'General Support' };
		} else if (!fullTicket.category.channelName) {
			fullTicket.category.channelName = 'ticket-{num}';
		}

		const transcriptCmd = client.commands?.commands?.slash?.get('transcript');
		if (transcriptCmd && typeof transcriptCmd.fillTemplate === 'function') {
			const { fileName, transcript } = await transcriptCmd.fillTemplate(fullTicket);
			return new AttachmentBuilder(Buffer.from(transcript, 'utf8'), { name: fileName });
		}

		const channelName = (fullTicket.category?.channelName || 'ticket-{num}')
			.replace(/{+\s?(user)?name\s?}+/gi, fullTicket.createdBy?.username || 'user')
			.replace(/{+\s?(nick|display)(name)?\s?}+/gi, fullTicket.createdBy?.displayName || 'user')
			.replace(/{+\s?num(ber)?\s?}+/gi, fullTicket.number || '0');
		const fileName = `${channelName}.md`;

		let fallbackMd = `# ${channelName} Ticket Transcript\n\n`;
		fallbackMd += `* Ticket ID: ${fullTicket.id}\n`;
		fallbackMd += `* Department: ${fullTicket.category?.name || 'General Support'}\n`;
		fallbackMd += `* Ticket Number: #${fullTicket.number}\n`;
		fallbackMd += `* Created At: ${fullTicket.createdAt}\n`;
		fallbackMd += `* Closed At: ${fullTicket.closedAt || new Date()}\n\n`;
		fallbackMd += `## Messages (${fullTicket.archivedMessages.length})\n\n`;

		for (const msg of fullTicket.archivedMessages) {
			fallbackMd += `[${msg.createdAt}] ${msg.authorId}: ${msg.content}\n`;
		}

		return new AttachmentBuilder(Buffer.from(fallbackMd, 'utf8'), { name: fileName });
	} catch (err) {
		client.log?.error?.(`Failed to generate transcript attachment for ${ticketId}: ${err.message}`);
		return null;
	}
}

/**
 * Log ticket events to designated audit log channel
 * @param {import("client")} client
 * @param {object} details
 * @param {string} details.userId
 * @param {string} details.action
 * @param {object} details.target
 * @param {object} [details.diff]
 * @param {object} [details.payload]
*/
async function logTicketEvent(client, {
	userId, action, target, diff, payload,
}) {
	try {
		let ticket = await client.tickets?.getTicket(target.id).catch?.(() => null);
		if (!ticket) {
			ticket = await client.prisma.ticket.findUnique({
				include: {
					category: true,
					feedback: true,
					guild: true,
				},
				where: { id: target.id },
			}).catch(() => null);
		}
		if (!ticket) return;

		// Check category logChannel first, then fallback to guild logChannel
		const logChannelId = ticket.category?.logChannel || ticket.guild?.logChannel;
		if (!logChannelId) return;

		const channel = client.channels.cache.get(logChannelId) || await client.channels.fetch(logChannelId).catch(() => null);
		if (!channel) return;

		const guild = client.guilds.cache.get(ticket.guildId || ticket.guild?.id);
		const member = (guild && userId) ? await guild.members.fetch(userId).catch(() => null) : null;
		const isSystem = !userId || (client.user && userId === client.user.id);
		const userDisplay = isSystem ? 'System' : (member ? `${member.displayName} (<@${userId}>)` : `<@${userId}>`);
		const logUserTag = member?.user?.tag || (isSystem ? 'System' : `User ${userId}`);

		client.log?.info?.tickets?.(`${logUserTag} ${action} ticket ${target.id}`);

		const actionThemes = {
			create: {
				color: '#6D28D9', // Purple
				title: 'Ticket Created',
			},
			close: {
				color: '#3B82F6', // Blue
				title: 'Ticket Closed',
			},
			resolve: {
				color: '#10B981', // Green
				title: 'Ticket Resolved',
			},
			archive: {
				color: '#64748B', // Slate
				title: 'Ticket Archived',
			},
			add_note: {
				color: '#8B5CF6', // Violet
				title: 'Internal Note Added',
			},
			update_details: {
				color: '#3B82F6', // Blue
				title: 'Ticket Details Updated',
			},
			change_department: {
				color: '#6366F1', // Indigo
				title: 'Department Transferred',
			},
			notify_staff: {
				color: '#F59E0B', // Amber
				title: 'Staff Assistance Requested',
			},
			claim: {
				color: '#EC4899', // Pink
				title: 'Ticket Claimed',
			},
			unclaim: {
				color: '#94A3B8', // Gray
				title: 'Ticket Released',
			},
			add: {
				color: '#10B981', // Green
				title: 'Member Added',
			},
			remove: {
				color: '#EF4444', // Red
				title: 'Member Removed',
			},
			rename: {
				color: '#3B82F6', // Blue
				title: 'Ticket Renamed',
			},
			priority: {
				color: '#F59E0B', // Amber
				title: 'Priority Changed',
			},
		};

		const currentTheme = actionThemes[action] || {
			color: ticket.guild?.primaryColour || '#6D28D9',
			title: `Ticket Event · ${action}`,
		};

		const formattedNumber = String(ticket.number || 0).padStart(4, '0');
		const embed = new EmbedBuilder()
			.setColor(currentTheme.color)
			.setTitle(`${currentTheme.title} · #${formattedNumber}`)
			.setFooter({
				text: ticket.guild?.footer || 'AERIX TICKETS INFRASTRUCTURE · AUDIT LOG',
				iconURL: guild?.iconURL() || undefined,
			})
			.setTimestamp();

		if (member) {
			embed.setAuthor({
				iconURL: member.displayAvatarURL(),
				name: member.displayName,
			});
		} else if (isSystem) {
			embed.setAuthor({
				iconURL: client.user?.displayAvatarURL(),
				name: 'Aerix Tickets System',
			});
		}

		const files = [];
		const components = [...(payload?.components || [])];

		if (action === 'create') {
			embed.addFields([
				{
					name: 'Ticket',
					value: target.name || `<#${ticket.id}>`,
					inline: true,
				},
				{
					name: 'Department',
					value: ticket.category?.name || 'General Support',
					inline: true,
				},
				{
					name: 'Created By',
					value: `<@${ticket.createdById}> (\`${ticket.createdById}\`)`,
					inline: true,
				},
				{
					name: 'Created At',
					value: `<t:${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}:f> (<t:${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}:R>)`,
					inline: false,
				},
			]);

			// Intake answers if available
			const qaList = await client.prisma.questionAnswer.findMany({
				include: { question: true },
				where: { ticketId: ticket.id },
			}).catch(() => []);

			for (const qa of qaList) {
				let ansText = qa.value;
				try {
					ansText = await crypto.queue(w => w.decrypt(ansText));
				} catch (_) {}
				if (ansText) {
					embed.addFields([{
						name: qa.question?.label || 'Intake Answer',
						value: String(ansText).slice(0, 1024),
						inline: false,
					}]);
				}
			}

			if (ticket.topic) {
				let topicVal = ticket.topic;
				try {
					topicVal = await crypto.queue(w => w.decrypt(topicVal));
				} catch (_) {}
				if (topicVal) {
					embed.addFields([{
						name: 'Subject / Topic',
						value: String(topicVal).slice(0, 1024),
						inline: false,
					}]);
				}
			}
		} else if (action === 'close') {
			const createdMs = new Date(ticket.createdAt).getTime();
			const closedMs = ticket.closedAt ? new Date(ticket.closedAt).getTime() : Date.now();
			const durationMs = Math.max(0, closedMs - createdMs);

			embed.addFields([
				{
					name: 'Ticket',
					value: `${ticket.category?.name || 'Ticket'} #${formattedNumber} (\`${ticket.id}\`)`,
					inline: true,
				},
				{
					name: 'Department',
					value: ticket.category?.name || 'General Support',
					inline: true,
				},
				{
					name: 'Created By',
					value: `<@${ticket.createdById}> (\`${ticket.createdById}\`)`,
					inline: true,
				},
				{
					name: 'Closed By',
					value: userDisplay,
					inline: true,
				},
				{
					name: 'Duration',
					value: ms(durationMs, { long: true }) || 'Just now',
					inline: true,
				},
				{
					name: 'Created At',
					value: `<t:${Math.floor(createdMs / 1000)}:f>`,
					inline: true,
				},
				{
					name: 'Closed At',
					value: `<t:${Math.floor(closedMs / 1000)}:f>`,
					inline: true,
				},
			]);

			if (payload?.fields && Array.isArray(payload.fields)) {
				const existingNames = new Set((embed.data.fields || []).map(f => f.name.toLowerCase()));
				for (const f of payload.fields) {
					if (f?.name && !existingNames.has(f.name.toLowerCase())) {
						embed.addFields([f]);
					}
				}
			}

			if (ticket.feedback) {
				const stars = Array(ticket.feedback.rating).fill('⭐').join(' ');
				embed.addFields([{
					name: 'Member Rating',
					value: `${stars} (${ticket.feedback.rating}/5)`,
					inline: true,
				}]);
				if (ticket.feedback.comment) {
					let commentVal = ticket.feedback.comment;
					try {
						commentVal = await crypto.queue(w => w.decrypt(commentVal));
					} catch (_) {}
					if (commentVal) {
						embed.addFields([{
							name: 'Feedback Comment',
							value: String(commentVal).slice(0, 1024),
							inline: false,
						}]);
					}
				}
			}

			// Generate and attach transcript
			const transcriptAttachment = await buildTranscriptAttachment(client, ticket.id);
			if (transcriptAttachment) {
				files.push(transcriptAttachment);
			}

			// Add "View Transcript" button if not already present
			if (components.length === 0) {
				components.push(
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId(JSON.stringify({
								action: 'transcript',
								ticket: ticket.id,
							}))
							.setStyle(ButtonStyle.Primary)
							.setLabel('View Transcript')
					)
				);
			}
		} else if (action === 'change_department') {
			embed.addFields([
				{
					name: 'Ticket',
					value: target.name || `<#${ticket.id}>`,
					inline: true,
				},
				{
					name: 'Transferred By',
					value: userDisplay,
					inline: true,
				},
				{
					name: 'From Department',
					value: payload?.fromDepartment || diff?.category?.from || 'Previous',
					inline: true,
				},
				{
					name: 'To Department',
					value: payload?.toDepartment || diff?.category?.to || ticket.category?.name || 'New',
					inline: true,
				},
			]);
		} else if (action === 'add_note') {
			embed.addFields([
				{
					name: 'Ticket',
					value: target.name || `<#${ticket.id}>`,
					inline: true,
				},
				{
					name: 'Staff Member',
					value: userDisplay,
					inline: true,
				},
				{
					name: 'Internal Note',
					value: String(payload?.note || diff?.note || 'No note text').slice(0, 1024),
					inline: false,
				},
			]);
		} else if (action === 'notify_staff') {
			embed.addFields([
				{
					name: 'Ticket',
					value: target.name || `<#${ticket.id}>`,
					inline: true,
				},
				{
					name: 'Requested By',
					value: userDisplay,
					inline: true,
				},
				{
					name: 'Department',
					value: ticket.category?.name || 'General Support',
					inline: true,
				},
			]);
			if (payload?.pings) {
				embed.addFields([{
					name: 'Notified Roles',
					value: payload.pings.slice(0, 1024),
					inline: false,
				}]);
			}
		} else if (action === 'resolve' || action === 'archive') {
			embed.addFields([
				{
					name: 'Ticket',
					value: target.name || `<#${ticket.id}>`,
					inline: true,
				},
				{
					name: action === 'resolve' ? 'Resolved By' : 'Archived By',
					value: userDisplay,
					inline: true,
				},
				{
					name: 'Department',
					value: ticket.category?.name || 'General Support',
					inline: true,
				},
			]);
		} else {
			embed.addFields([
				{
					name: 'Ticket',
					value: target.name ? `${target.name} (\`${target.id}\`)` : target.id,
					inline: true,
				},
				{
					name: 'Action By',
					value: userDisplay,
					inline: true,
				},
			]);
			if (payload?.fields && Array.isArray(payload.fields)) {
				embed.addFields(payload.fields);
			}
		}

		const embeds = [embed];

		if (diff?.original && Object.entries(makeDiff(diff)).length) {
			embeds.push(
				new EmbedBuilder()
					.setColor(currentTheme.color)
					.setTitle('Detected Changes')
					.setFields(makeDiff(diff)),
			);
		}

		await channel.send({
			components,
			embeds,
			files,
		});
	} catch (err) {
		client.log?.error?.(`Failed to send ticket event audit log: ${err.message}`);
	}
}

/**
 * @param {import("client")} client
 * @param {object} details
 * @param {string} details.action
 * @param {import("discord.js").Message} details.target
 * @param {import("@prisma/client").Ticket & {guild: import("@prisma/client").Guild}} details.ticket
*/
async function logMessageEvent(client, {
	action, executor, target, ticket, diff,
}) {
	if (!ticket) return;
	if (executor === undefined) executor = target.member;
	client.log.info.tickets(`${executor?.user.tag || 'Unknown'} ${client.i18n.getMessage('en-GB', `log.message.verb.${action}`)} message ${target.id}`);
	if (!ticket.guild.logChannel) return;
	const colour = action === 'update'
		? 'Purple' : action === 'delete'
			? 'DarkPurple' : 'Default';
	const getMessage = client.i18n.getLocale(ticket.guild.locale);
	const i18nOptions = {
		user: `<@${executor?.user.id}>`,
		verb: getMessage(`log.message.verb.${action}`),
	};
	const channel = client.channels.cache.get(ticket.guild.logChannel);
	if (!channel) return;
	const embeds = [
		new EmbedBuilder()
			.setColor(colour)
			.setAuthor({
				iconURL: target.member?.displayAvatarURL() || 'https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png',
				name: target.member?.displayName || 'Unknown',
			})
			.setTitle(getMessage('log.message.title', i18nOptions))
			.setDescription(getMessage('log.message.description', i18nOptions))
			.addFields([
				{
					name: getMessage('log.message.message'),
					value: `[\`${target.id}\`](${target.url})`,
				},
			]),
	];

	if (diff?.original && Object.entries(makeDiff(diff)).length) {
		embeds.push(
			new EmbedBuilder()
				.setColor(colour)
				.setTitle(getMessage('log.admin.changes'))
				.setFields(makeDiff(diff)),
		);
	}

	return await channel.send({ embeds });
}

module.exports = {
	getLogChannel,
	getSUID,
	logAdminEvent,
	logMessageEvent,
	logTicketEvent,
};

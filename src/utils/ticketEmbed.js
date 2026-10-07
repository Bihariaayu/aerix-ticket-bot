const { EmbedBuilder } = require('discord.js');
const theme = require('../config/theme');

/**
 * Replace common template placeholders in a string
 * @param {string} str 
 * @param {object} context 
 * @returns {string}
 */
function formatPlaceholders(str, { number, department, creatorId, status }) {
	if (!str || typeof str !== 'string') return '';
	return str
		.replace(/{+\s?(user)?name\s?}+/gi, `<@${creatorId}>`)
		.replace(/{+\s?creator\s?}+/gi, `<@${creatorId}>`)
		.replace(/{+\s?user\s?}+/gi, `<@${creatorId}>`)
		.replace(/{+\s?num(ber)?\s?}+/gi, String(number).padStart(4, '0'))
		.replace(/{+\s?rawNum(ber)?\s?}+/gi, String(number))
		.replace(/{+\s?dep(artment)?\s?}+/gi, department || 'Support')
		.replace(/{+\s?status\s?}+/gi, status || 'Active')
		.replace(/{+\s?avgResponseTime\s?}+/gi, '30s')
		.replace(/{+\s?avgResolutionTime\s?}+/gi, '1h')
		.replace(/{+\s?avgRating\s?}+/gi, '5.0');
}

/**
 * Build the modern SaaS-style helpdesk ticket embed with full customization
 * @param {object} options
 * @param {object} options.ticket
 * @param {object} options.category
 * @param {import("discord.js").Guild} options.guild
 * @param {import("discord.js").GuildMember|object} options.creator
 * @param {string} [options.status='Active']
 * @param {Array} [options.answers=[]]
 * @param {string} [options.topic]
 * @param {object} [options.resolvedInfo]
 * @returns {EmbedBuilder}
 */
function buildTicketEmbed({
	ticket,
	category,
	guild,
	creator,
	status = 'Active',
	answers = [],
	topic = null,
	resolvedInfo = null,
}) {
	const number = ticket?.number ?? 1;
	const departmentName = category?.name || ticket?.category?.name || 'General Support';
	const creatorId = ticket?.createdById || creator?.id;
	const createdTs = ticket?.createdAt ? Math.floor(new Date(ticket.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000);

	const context = {
		number,
		department: departmentName,
		creatorId,
		status,
	};

	// Determine embed color
	let embedColor;
	if (status === 'Resolved') embedColor = theme.colors.success;
	else if (status === 'Archived') embedColor = theme.colors.archived;
	else if (status === 'Closed') embedColor = theme.colors.danger;
	else {
		embedColor = category?.embedColor || guild?.embedColor || category?.guild?.primaryColour || guild?.primaryColour || theme.colors.primary;
	}

	// Determine title
	const rawTitle = category?.embedTitle || guild?.embedTitle || `Ticket #{number} · {department}`;
	const formattedTitle = formatPlaceholders(rawTitle, context);

	const embed = new EmbedBuilder()
		.setColor(embedColor)
		.setTitle(formattedTitle.slice(0, 256))
		.setTimestamp(ticket?.createdAt ? new Date(ticket.createdAt) : new Date());

	if (creator) {
		const displayName = creator.displayName || creator.user?.username || 'Member';
		const username = creator.user?.username || creator.username || 'user';
		const avatar = typeof creator.displayAvatarURL === 'function'
			? creator.displayAvatarURL({ forceStatic: false })
			: creator.avatarURL || guild?.iconURL();

		embed.setAuthor({
			name: `${displayName} (@${username})`,
			iconURL: avatar,
		});
	}

	// Structured metadata fields
	embed.addFields(
		{
			name: 'Status',
			value: `\`${status}\``,
			inline: true,
		},
		{
			name: 'Member',
			value: `<@${creatorId}>`,
			inline: true,
		},
		{
			name: 'Department',
			value: departmentName,
			inline: true,
		},
		{
			name: 'Created',
			value: `<t:${createdTs}:f>\n<t:${createdTs}:R>`,
			inline: true,
		},
	);

	if (resolvedInfo?.resolvedById) {
		const resTs = resolvedInfo.resolvedAt ? Math.floor(new Date(resolvedInfo.resolvedAt).getTime() / 1000) : Math.floor(Date.now() / 1000);
		embed.addFields({
			name: 'Resolved By',
			value: `<@${resolvedInfo.resolvedById}> (<t:${resTs}:R>)`,
			inline: true,
		});
	}

	// Message / Intake details
	if (answers && answers.length > 0) {
		for (const ans of answers) {
			const label = ans.label || ans.question?.label || 'Intake Field';
			let val = ans.plainValue || ans.value || 'Not provided';
			if (typeof val === 'string' && val.trim().length > 0) {
				val = val.trim();
			} else {
				val = 'Not provided';
			}
			embed.addFields({
				name: label.slice(0, 256),
				value: `> ${val.replace(/\n/g, '\n> ').slice(0, 1020)}`,
				inline: false,
			});
		}
	} else if (topic || ticket?.topic) {
		const msg = (topic || ticket.topic || '').trim();
		embed.addFields({
			name: 'Message',
			value: `> ${msg.replace(/\n/g, '\n> ').slice(0, 1020) || 'No message provided.'}`,
			inline: false,
		});
	}

	// Support Notice
	const rawNotice = category?.embedNotice || guild?.embedNotice || category?.openingMessage || 'Thank you for contacting Aerix Support.\nA staff member will assist you shortly.';
	const formattedNotice = formatPlaceholders(rawNotice, context);

	embed.addFields({
		name: 'Support Notice',
		value: `> ${formattedNotice.replace(/\n/g, '\n> ').slice(0, 1020)}`,
		inline: false,
	});

	if (category?.image) {
		embed.setImage(category.image);
	}

	// Footer
	const rawFooter = category?.embedFooter || guild?.embedFooter || category?.guild?.footer || guild?.footer || theme.brand.shortFooter;
	const formattedFooter = formatPlaceholders(rawFooter, context);

	embed.setFooter({
		iconURL: guild?.iconURL() || undefined,
		text: formattedFooter.slice(0, 2048),
	});

	return embed;
}

module.exports = {
	buildTicketEmbed,
	formatPlaceholders,
};

const { MessageFlags } = require('discord.js');
const ms = require('ms');
const { canUserControl } = require('../../../services/permissionService');
const { getTicket } = require('../../../services/ticketService');

/**
 * Handle Notify Staff button interaction
 * @param {import("discord.js").ButtonInteraction} interaction 
 */
async function handle(interaction) {
	const client = interaction.client;
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const ticket = await getTicket(client, interaction.channel.id);

	if (!ticket) {
		return await interaction.editReply({
			content: 'This channel is not an active ticket.',
		});
	}

	const allowed = await canUserControl(ticket, interaction.guild, interaction.user.id);
	if (!allowed) {
		return await interaction.editReply({
			content: "You don't have permission to use this action.",
		});
	}

	const cooldownKey = `cooldown:notify_staff:${ticket.id}`;
	const lastNotified = await client.keyv.get(cooldownKey);
	const cooldownPeriod = ms('10m');

	if (lastNotified && Date.now() - lastNotified < cooldownPeriod) {
		return await interaction.editReply({
			content: 'Staff were recently notified. Please wait before notifying them again.',
		});
	}

	await client.keyv.set(cooldownKey, Date.now(), cooldownPeriod);

	let pingRoles = [];
	try {
		const rawPingRoles = ticket.category?.pingRoles;
		const parsedPingRoles = rawPingRoles
			? (Array.isArray(rawPingRoles) ? rawPingRoles : JSON.parse(rawPingRoles || '[]'))
			: [];
		if (parsedPingRoles.length > 0) {
			pingRoles = parsedPingRoles;
		} else if (ticket.category?.staffRoles) {
			const rawStaff = ticket.category.staffRoles;
			pingRoles = Array.isArray(rawStaff) ? rawStaff : JSON.parse(rawStaff || '[]');
		}
	} catch (_) {}

	const pings = pingRoles
		.filter(roleId => interaction.guild.roles.cache.has(roleId))
		.map(roleId => `<@&${roleId}>`)
		.join(' ');

	const customNotifyMsg = ticket.category?.notifyStaffMessage || ticket.guild?.notifyStaffMessage;
	let notifyContent;
	if (customNotifyMsg && customNotifyMsg.trim()) {
		notifyContent = customNotifyMsg
			.replace(/{+\s?(user)?name\s?}+/gi, interaction.user.toString())
			.replace(/{+\s?creator\s?}+/gi, interaction.user.toString())
			.replace(/{+\s?user\s?}+/gi, interaction.user.toString())
			.replace(/{+\s?staff\s?}+/gi, pings ? pings + ' ' : '')
			.replace(/{+\s?department\s?}+/gi, ticket.category?.name || 'Support')
			.replace(/{+\s?num(ber)?\s?}+/gi, String(ticket.number).padStart(4, '0'));
	} else {
		notifyContent = `${pings ? pings + ' ' : ''}Staff assistance requested by ${interaction.user.toString()}. A team member will reply shortly.`;
	}

	await interaction.channel.send({
		content: notifyContent,
	});

	await interaction.editReply({
		content: 'The support team has been notified.',
	});
}

module.exports = { handle };

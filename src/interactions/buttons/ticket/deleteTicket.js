const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { canManageTicket } = require('../../../services/permissionService');
const { getTicket } = require('../../../services/ticketService');
const { IDS } = require('../../../utils/ticketButtons');

/**
 * Handle Delete Ticket request (Staff only)
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

	const allowed = await canManageTicket(ticket, interaction.guild, interaction.user.id);
	if (!allowed) {
		return await interaction.editReply({
			content: "You don't have permission to use this action.",
		});
	}

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(IDS.DELETE_CONFIRM)
			.setLabel('Delete Ticket')
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId(IDS.CANCEL)
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary),
	);

	await interaction.editReply({
		content: 'This will permanently delete the ticket. Are you sure?',
		components: [row],
	});
}

module.exports = { handle };

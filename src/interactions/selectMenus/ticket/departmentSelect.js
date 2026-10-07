const { EmbedBuilder, MessageFlags } = require('discord.js');
const theme = require('../../../config/theme');
const { canUserControl } = require('../../../services/permissionService');
const { getTicket, refreshTicketMessage } = require('../../../services/ticketService');
const { logTicketEvent } = require('../../../lib/logging');

/**
 * Handle Department Select menu interaction
 * @param {import("discord.js").StringSelectMenuInteraction} interaction 
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

	const newCategoryId = parseInt(interaction.values[0], 10);
	const newCategory = await client.prisma.category.findUnique({
		where: { id: newCategoryId },
	});

	if (!newCategory) {
		return await interaction.editReply({
			content: 'Selected department could not be found.',
		});
	}

	const oldCategoryName = ticket.category?.name || 'Previous Department';

	// Update ticket category in database
	await client.prisma.ticket.update({
		data: { categoryId: newCategoryId },
		where: { id: ticket.id },
	});

	// If the new category specifies a Discord Category channel, move it
	if (newCategory.discordCategory && interaction.channel.parentId !== newCategory.discordCategory) {
		try {
			await interaction.channel.setParent(newCategory.discordCategory, { lockPermissions: false });
		} catch (_) {}
	}

	const refreshedTicket = await getTicket(client, ticket.id);
	await refreshTicketMessage(client, interaction.channel, refreshedTicket);

	await interaction.editReply({
		content: `Department successfully changed to **${newCategory.name}**.`,
	});

	const transferEmbed = new EmbedBuilder()
		.setColor(theme.colors.secondary)
		.setDescription(`Ticket transferred from **${oldCategoryName}** to **${newCategory.name}** by ${interaction.user.toString()}.`);

	await interaction.channel.send({ embeds: [transferEmbed] });

	logTicketEvent(client, {
		action: 'update',
		diff: { category: { from: oldCategoryName, to: newCategory.name } },
		target: { id: ticket.id, name: interaction.channel.toString() },
		userId: interaction.user.id,
	});
}

module.exports = { handle };

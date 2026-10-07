const { EmbedBuilder } = require('discord.js');
const theme = require('../config/theme');
const { buildTicketEmbed } = require('../utils/ticketEmbed');
const { getTicketActionRows } = require('../utils/ticketButtons');
const { logTicketEvent } = require('../lib/logging');

/**
 * Fetch full ticket with category and answers
 */
async function getTicket(client, channelId) {
	return await client.prisma.ticket.findUnique({
		include: {
			category: true,
			guild: true,
			questionAnswers: {
				include: {
					question: true,
				},
			},
		},
		where: { id: channelId },
	});
}

/**
 * Get current lifecycle state of a ticket
 */
async function getTicketState(client, ticketId) {
	const data = await client.keyv.get(`ticket:state:${ticketId}`);
	if (data && data.state) return data;
	return { state: 'Active' };
}

/**
 * Set lifecycle state of a ticket
 */
async function setTicketState(client, ticketId, state, meta = {}) {
	const existing = (await client.keyv.get(`ticket:state:${ticketId}`)) || {};
	const updated = { ...existing, state, ...meta };
	await client.keyv.set(`ticket:state:${ticketId}`, updated);
	return updated;
}

/**
 * Re-render and update the ticket opening message in Discord
 */
async function refreshTicketMessage(client, channel, ticket, overrideState = null, resolvedInfo = null) {
	try {
		if (!ticket || !ticket.openingMessageId) return;
		const openingMessage = await channel.messages.fetch(ticket.openingMessageId).catch(() => null);
		if (!openingMessage) return;

		let state = overrideState;
		if (!state) {
			const stateObj = await getTicketState(client, ticket.id);
			state = stateObj.state;
			if (!resolvedInfo && stateObj.resolvedById) {
				resolvedInfo = stateObj;
			}
		}

		const member = await channel.guild.members.fetch(ticket.createdById).catch(() => null);

		const embed = buildTicketEmbed({
			ticket,
			category: ticket.category,
			guild: channel.guild,
			creator: member || { id: ticket.createdById },
			status: state,
			answers: ticket.questionAnswers || [],
			topic: ticket.topic,
			resolvedInfo,
		});

		const rows = getTicketActionRows(state);

		await openingMessage.edit({
			embeds: [embed],
			components: rows,
		});
	} catch (err) {
		client.log.error(`Failed to refresh ticket message for channel ${channel?.id}: ${err.message}`);
	}
}

/**
 * Resolve ticket
 */
async function resolveTicket(client, interaction, ticket) {
	const resolvedInfo = {
		resolvedById: interaction.user.id,
		resolvedAt: Date.now(),
	};

	await setTicketState(client, ticket.id, 'Resolved', resolvedInfo);
	await refreshTicketMessage(client, interaction.channel, ticket, 'Resolved', resolvedInfo);

	const notifyEmbed = new EmbedBuilder()
		.setColor(theme.colors.success)
		.setDescription(`Ticket has been marked as **Resolved** by ${interaction.user.toString()}.`);

	await interaction.channel.send({ embeds: [notifyEmbed] });

	logTicketEvent(client, {
		action: 'update',
		diff: { status: { from: 'Active', to: 'Resolved' } },
		target: { id: ticket.id, name: interaction.channel.toString() },
		userId: interaction.user.id,
	});
}

/**
 * Archive ticket
 */
async function archiveTicket(client, interaction, ticket) {
	const archiveInfo = {
		archivedById: interaction.user.id,
		archivedAt: Date.now(),
	};

	await setTicketState(client, ticket.id, 'Archived', archiveInfo);

	// Lock messaging for ticket creator
	try {
		await interaction.channel.permissionOverwrites.edit(
			ticket.createdById,
			{ SendMessages: false },
			`Ticket archived by ${interaction.user.tag}`
		);
	} catch (_) {}

	await refreshTicketMessage(client, interaction.channel, ticket, 'Archived');

	const notifyEmbed = new EmbedBuilder()
		.setColor(theme.colors.archived)
		.setDescription(`Ticket has been **Archived** by ${interaction.user.toString()}. This channel is now read-only.`);

	await interaction.channel.send({ embeds: [notifyEmbed] });

	logTicketEvent(client, {
		action: 'update',
		diff: { status: { from: 'Resolved', to: 'Archived' } },
		target: { id: ticket.id, name: interaction.channel.toString() },
		userId: interaction.user.id,
	});
}

/**
 * Add internal staff note
 */
async function addInternalNote(client, ticketId, staffUser, noteText) {
	const key = `ticket:notes:${ticketId}`;
	const notes = (await client.keyv.get(key)) || [];
	const noteObj = {
		staffId: staffUser.id,
		staffTag: staffUser.tag,
		note: noteText,
		timestamp: Date.now(),
	};
	notes.push(noteObj);
	await client.keyv.set(key, notes);
	return notes;
}

/**
 * Get internal staff notes
 */
async function getInternalNotes(client, ticketId) {
	return (await client.keyv.get(`ticket:notes:${ticketId}`)) || [];
}

/**
 * Close ticket
 */
async function closeTicket(client, interaction, ticket) {
	await client.prisma.ticket.update({
		data: {
			open: false,
			closedAt: new Date(),
			closedById: interaction.user.id,
			closedReason: 'Closed by user or staff',
		},
		where: { id: ticket.id },
	});

	await setTicketState(client, ticket.id, 'Closed');

	const notifyEmbed = new EmbedBuilder()
		.setColor(theme.colors.danger)
		.setDescription(`Ticket has been closed by ${interaction.user.toString()}.\nThis channel will be deleted in a few moments.`);

	await interaction.channel.send({ embeds: [notifyEmbed] });

	setTimeout(async () => {
		try {
			await interaction.channel.delete(`Ticket closed by ${interaction.user.tag}`);
		} catch (_) {}
	}, 5000);
}

/**
 * Permanently delete ticket
 */
async function deleteTicket(client, interaction, ticket) {
	await client.prisma.ticket.update({
		data: {
			open: false,
			deleted: true,
			closedAt: new Date(),
			closedById: interaction.user.id,
			closedReason: 'Permanently deleted by staff',
		},
		where: { id: ticket.id },
	});

	const notifyEmbed = new EmbedBuilder()
		.setColor(theme.colors.danger)
		.setDescription(`This ticket channel is being permanently deleted by ${interaction.user.toString()}...`);

	await interaction.channel.send({ embeds: [notifyEmbed] });

	setTimeout(async () => {
		try {
			await interaction.channel.delete(`Ticket deleted by ${interaction.user.tag}`);
		} catch (_) {}
	}, 3000);
}

module.exports = {
	getTicket,
	getTicketState,
	setTicketState,
	refreshTicketMessage,
	resolveTicket,
	archiveTicket,
	addInternalNote,
	getInternalNotes,
	closeTicket,
	deleteTicket,
};

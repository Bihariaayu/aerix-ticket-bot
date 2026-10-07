const { EmbedBuilder } = require('discord.js');
const theme = require('../config/theme');
const { setTicketState } = require('./ticketService');

// Set of ticket IDs currently undergoing auto-close sequence
const closingTickets = new Set();

/**
 * Format minutes into clean human-readable text
 * @param {number} minutes 
 * @returns {string}
 */
function formatDuration(minutes) {
	if (!minutes || minutes <= 0) return '0 minutes';
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
	if (minutes % 1440 === 0) {
		const days = minutes / 1440;
		return `${days} day${days === 1 ? '' : 's'}`;
	}
	if (minutes % 60 === 0) {
		const hours = minutes / 60;
		return `${hours} hour${hours === 1 ? '' : 's'}`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
}

/**
 * Check all open tickets and auto-close any that exceeded the configured inactivity threshold
 * @param {import("discord.js").Client} client 
 */
async function checkInactiveTickets(client) {
	try {
		const openTickets = await client.prisma.ticket.findMany({
			where: {
				open: true,
				deleted: false,
			},
			include: {
				category: true,
				guild: true,
			},
		});

		if (!openTickets || openTickets.length === 0) return;

		const now = Date.now();

		for (const ticket of openTickets) {
			if (closingTickets.has(ticket.id)) continue;

			// Check category override first, fallback to guild default
			let autoCloseMinutes = null;

			if (ticket.category && ticket.category.autoCloseMinutes !== null && ticket.category.autoCloseMinutes !== undefined) {
				autoCloseMinutes = ticket.category.autoCloseMinutes;
				// If set to 0 or negative, auto-close is explicitly disabled for this department
				if (autoCloseMinutes <= 0) continue;
			} else if (ticket.guild && ticket.guild.autoCloseMinutes !== null && ticket.guild.autoCloseMinutes !== undefined && ticket.guild.autoCloseMinutes > 0) {
				autoCloseMinutes = ticket.guild.autoCloseMinutes;
			}

			// If no valid autoCloseMinutes configured, skip this ticket
			if (!autoCloseMinutes || autoCloseMinutes <= 0) continue;

			const thresholdMs = autoCloseMinutes * 60 * 1000;
			const lastActiveTime = ticket.lastMessageAt ? new Date(ticket.lastMessageAt).getTime() : new Date(ticket.createdAt).getTime();
			const inactiveDurationMs = now - lastActiveTime;

			if (inactiveDurationMs >= thresholdMs) {
				// Mark as currently closing to avoid duplicate triggers
				closingTickets.add(ticket.id);

				const durationText = formatDuration(autoCloseMinutes);
				client.log?.info?.(`[AutoClose] Ticket #${ticket.number} (${ticket.id}) inactive for ${Math.round(inactiveDurationMs / 60000)}m (threshold: ${autoCloseMinutes}m). Auto-closing...`);

				try {
					const channel = client.channels.cache.get(ticket.id) || await client.channels.fetch(ticket.id).catch(() => null);

					if (!channel) {
						// Channel already removed from Discord
						await client.tickets.finallyClose(ticket.id, {
							reason: `Auto-closed due to inactivity (${durationText})`,
						}).catch(err => client.log?.error?.(err));
						closingTickets.delete(ticket.id);
						continue;
					}

					// Send professional closing embed
					const embed = new EmbedBuilder()
						.setColor(theme.colors.danger || '#EF4444')
						.setTitle('Ticket Auto-Closed')
						.setDescription(`This ticket has been automatically closed due to inactivity.\nNo response was received in this channel for over **${durationText}**.`)
						.setFooter({ text: ticket.guild?.footer || 'AERIX TICKETS INFRASTRUCTURE' })
						.setTimestamp();

					await channel.send({ embeds: [embed] }).catch(() => null);

					await setTicketState(client, ticket.id, 'Closed', {
						closedReason: `Auto-closed due to inactivity (${durationText})`,
					}).catch(() => null);

					// Grace period before channel deletion to allow transcript / audit log capture
					setTimeout(async () => {
						try {
							await client.tickets.finallyClose(ticket.id, {
								reason: `Auto-closed due to inactivity (${durationText})`,
							});
						} catch (closeErr) {
							client.log?.error?.(`[AutoClose] Error in finallyClose for ticket ${ticket.id}:`, closeErr);
						} finally {
							closingTickets.delete(ticket.id);
						}
					}, 5000);
				} catch (ticketErr) {
					client.log?.error?.(`[AutoClose] Failed to auto-close ticket ${ticket.id}:`, ticketErr);
					closingTickets.delete(ticket.id);
				}
			}
		}
	} catch (error) {
		client.log?.error?.('[AutoClose] Inactivity check error:', error);
	}
}

/**
 * Initialize and start the background auto-close worker
 * @param {import("discord.js").Client} client 
 * @param {number} intervalMs 
 */
function startAutoCloseWorker(client, intervalMs = 60_000) {
	client.log?.info?.('[AutoClose] Inactivity auto-close worker initialized (runs every 60s)');
	// Initial check after 10 seconds of bot startup
	setTimeout(() => checkInactiveTickets(client), 10_000);
	// Recurring check
	return setInterval(() => checkInactiveTickets(client), intervalMs);
}

module.exports = {
	formatDuration,
	checkInactiveTickets,
	startAutoCloseWorker,
};

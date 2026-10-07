const { PermissionFlagsBits } = require('discord.js');
const { isStaff: legacyIsStaff } = require('../lib/users');

/**
 * Check if a guild member has staff/manager privileges
 * @param {import("discord.js").Guild} guild 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
async function isStaff(guild, userId) {
	if (!guild || !userId) return false;
	try {
		const member = await guild.members.fetch(userId).catch(() => null);
		if (!member) return false;

		// Administrators and Guild Owners always qualify
		if (member.id === guild.ownerId || member.permissions.has(PermissionFlagsBits.Administrator) || member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			return true;
		}

		return await legacyIsStaff(guild, userId);
	} catch (_) {
		return false;
	}
}

/**
 * Check if user is the original creator of the ticket
 * @param {object} ticket 
 * @param {string} userId 
 * @returns {boolean}
 */
function isTicketOwner(ticket, userId) {
	if (!ticket || !userId) return false;
	return ticket.createdById === userId;
}

/**
 * Check if user can execute customer actions (creator or staff)
 * @param {object} ticket 
 * @param {import("discord.js").Guild} guild 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
async function canUserControl(ticket, guild, userId) {
	if (isTicketOwner(ticket, userId)) return true;
	return await isStaff(guild, userId);
}

/**
 * Check if user can execute staff actions (staff only)
 * @param {object} ticket 
 * @param {import("discord.js").Guild} guild 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
async function canManageTicket(ticket, guild, userId) {
	return await isStaff(guild, userId);
}

module.exports = {
	isStaff,
	isTicketOwner,
	canUserControl,
	canManageTicket,
};

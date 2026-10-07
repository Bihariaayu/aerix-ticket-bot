const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Custom ID Constants
 */
const IDS = {
	USER_UPDATE_DETAILS: 'ticket_update_details',
	USER_CHANGE_DEPARTMENT: 'ticket_change_department',
	USER_NOTIFY_STAFF: 'ticket_notify_staff',
	USER_CLOSE: 'ticket_close',

	STAFF_RESOLVE: 'ticket_resolve',
	STAFF_ARCHIVE: 'ticket_archive',
	STAFF_ADD_NOTE: 'ticket_add_note',
	STAFF_DELETE: 'ticket_delete',

	CLOSE_CONFIRM: 'ticket_close_confirm',
	DELETE_CONFIRM: 'ticket_delete_confirm',
	CANCEL: 'ticket_cancel',
};

/**
 * Generate action rows based on ticket state
 * @param {string} [state='Active'] 'Active' | 'Resolved' | 'Archived' | 'Closed'
 * @returns {ActionRowBuilder[]}
 */
function getTicketActionRows(state = 'Active') {
	const rows = [];

	if (state === 'Active') {
		// User Action Row
		const userRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(IDS.USER_UPDATE_DETAILS)
				.setLabel('Update Details')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(IDS.USER_CHANGE_DEPARTMENT)
				.setLabel('Change Department')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(IDS.USER_NOTIFY_STAFF)
				.setLabel('Notify Staff')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(IDS.USER_CLOSE)
				.setLabel('Close Ticket')
				.setStyle(ButtonStyle.Danger),
		);

		// Staff Action Row
		const staffRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(IDS.STAFF_RESOLVE)
				.setLabel('Resolve')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId(IDS.STAFF_ARCHIVE)
				.setLabel('Archive')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(IDS.STAFF_ADD_NOTE)
				.setLabel('Add Note')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(IDS.STAFF_DELETE)
				.setLabel('Delete')
				.setStyle(ButtonStyle.Danger),
		);

		rows.push(userRow, staffRow);
	} else if (state === 'Resolved') {
		// In Resolved state, user controls are removed. Staff controls available:
		const staffRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(IDS.STAFF_ARCHIVE)
				.setLabel('Archive')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(IDS.STAFF_ADD_NOTE)
				.setLabel('Add Note')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(IDS.STAFF_DELETE)
				.setLabel('Delete')
				.setStyle(ButtonStyle.Danger),
		);

		rows.push(staffRow);
	} else if (state === 'Archived') {
		// In Archived state, only Delete is available:
		const staffRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(IDS.STAFF_DELETE)
				.setLabel('Delete')
				.setStyle(ButtonStyle.Danger),
		);

		rows.push(staffRow);
	}

	return rows;
}

module.exports = {
	IDS,
	getTicketActionRows,
};

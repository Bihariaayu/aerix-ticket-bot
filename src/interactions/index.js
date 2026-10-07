const updateDetails = require('./buttons/ticket/updateDetails');
const changeDepartment = require('./buttons/ticket/changeDepartment');
const notifyStaff = require('./buttons/ticket/notifyStaff');
const closeTicket = require('./buttons/ticket/closeTicket');
const resolveTicket = require('./buttons/ticket/resolveTicket');
const archiveTicket = require('./buttons/ticket/archiveTicket');
const addNote = require('./buttons/ticket/addNote');
const deleteTicket = require('./buttons/ticket/deleteTicket');
const closeConfirm = require('./buttons/ticket/closeConfirm');
const deleteConfirm = require('./buttons/ticket/deleteConfirm');
const cancel = require('./buttons/ticket/cancel');

const updateDetailsModal = require('./modals/ticket/updateDetailsModal');
const addNoteModal = require('./modals/ticket/addNoteModal');

const departmentSelect = require('./selectMenus/ticket/departmentSelect');

const buttonHandlers = {
	ticket_update_details: updateDetails.handle,
	ticket_change_department: changeDepartment.handle,
	ticket_notify_staff: notifyStaff.handle,
	ticket_close: closeTicket.handle,
	ticket_resolve: resolveTicket.handle,
	ticket_archive: archiveTicket.handle,
	ticket_add_note: addNote.handle,
	ticket_delete: deleteTicket.handle,
	ticket_close_confirm: closeConfirm.handle,
	ticket_delete_confirm: deleteConfirm.handle,
	ticket_cancel: cancel.handle,
};

const modalHandlers = {
	ticket_update_details_modal: updateDetailsModal.handle,
	ticket_add_note_modal: addNoteModal.handle,
};

const selectMenuHandlers = {
	ticket_department_select: departmentSelect.handle,
};

/**
 * Dispatch interaction to its specific handler
 * @param {import("discord.js").Interaction} interaction 
 * @returns {Promise<boolean>} True if handled, false otherwise
 */
async function dispatch(interaction) {
	const customId = interaction.customId;
	if (!customId) return false;

	if (interaction.isButton() && buttonHandlers[customId]) {
		await buttonHandlers[customId](interaction);
		return true;
	}

	if (interaction.isModalSubmit() && modalHandlers[customId]) {
		await modalHandlers[customId](interaction);
		return true;
	}

	if (interaction.isStringSelectMenu() && selectMenuHandlers[customId]) {
		await selectMenuHandlers[customId](interaction);
		return true;
	}

	return false;
}

module.exports = {
	dispatch,
	buttonHandlers,
	modalHandlers,
	selectMenuHandlers,
};

import axios from 'axios';
import { handleApiError } from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const reminderService = {
    async createReminder(reminderData) {
        try {
            const response = await axios.post(`${API_URL}/reminders`, reminderData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async getUserReminders() {
        try {
            const response = await axios.get(`${API_URL}/reminders`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async updateReminderStatus(id, status) {
        try {
            const response = await axios.patch(`${API_URL}/reminders/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async sendManualReminder(id) {
        try {
            const response = await axios.post(`${API_URL}/reminders/${id}/send`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};

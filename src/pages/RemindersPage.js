import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import AddReminder from '../components/AddReminder';
import ReminderList from '../components/ReminderList';
import { reminderService } from '../services/reminderService';

const RemindersPage = () => {
    const [reminders, setReminders] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const loadReminders = async () => {
        try {
            const response = await reminderService.getUserReminders();
            setReminders(response.reminders);
        } catch (err) {
            setError(err.message || 'Failed to load reminders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReminders();
    }, []);

    const handleReminderAdded = (newReminder) => {
        setReminders(prev => [newReminder, ...prev]);
    };

    const handleSendReminder = async (id) => {
        try {
            await reminderService.sendManualReminder(id);
            setSuccess('Reminder sent successfully!');
            loadReminders(); // Refresh the list to update reminder count and last reminded time
        } catch (err) {
            setError(err.message || 'Failed to send reminder');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await reminderService.updateReminderStatus(id, status);
            setSuccess('Status updated successfully!');
            loadReminders(); // Refresh the list
        } catch (err) {
            setError(err.message || 'Failed to update status');
        }
    };

    // Clear messages after 5 seconds
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    return (
        <Container>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {success && <Alert variant="success" className="mt-3">{success}</Alert>}

            <Row className="mt-4">
                <Col md={4}>
                    <AddReminder onReminderAdded={handleReminderAdded} />
                </Col>
                <Col md={8}>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <ReminderList
                            reminders={reminders}
                            onSendReminder={handleSendReminder}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default RemindersPage;

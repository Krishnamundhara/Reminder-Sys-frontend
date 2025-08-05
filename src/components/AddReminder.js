import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { reminderService } from '../services/reminderService';

const AddReminder = ({ onReminderAdded }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        amount: '',
        due_date: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Format amount to ensure it's a number
            const reminderData = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            const response = await reminderService.createReminder(reminderData);
            setSuccess('Reminder created successfully!');
            setFormData({
                customer_name: '',
                customer_phone: '',
                amount: '',
                due_date: '',
                notes: ''
            });
            if (onReminderAdded) {
                onReminderAdded(response.reminder);
            }
        } catch (err) {
            setError(err.message || 'Failed to create reminder');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modern-card mb-4">
            <h3 className="mb-3">Add New Payment Reminder</h3>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Customer Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                        className="modern-input"
                        placeholder="Enter customer name"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>WhatsApp Number</Form.Label>
                    <Form.Control
                        type="tel"
                        name="customer_phone"
                        value={formData.customer_phone}
                        onChange={handleChange}
                        required
                        className="modern-input"
                        placeholder="Enter WhatsApp number (with country code)"
                    />
                    <Form.Text className="text-muted">
                        Format: 91XXXXXXXXXX (include country code)
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Amount (₹)</Form.Label>
                    <Form.Control
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="modern-input"
                        placeholder="Enter amount"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleChange}
                        required
                        className="modern-input"
                        min={new Date().toISOString().split('T')[0]}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Notes (Optional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="modern-input"
                        placeholder="Add any additional notes"
                        rows={3}
                    />
                </Form.Group>

                <Button
                    type="submit"
                    className="glow-button w-100"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Reminder'}
                </Button>
            </Form>
        </div>
    );
};

export default AddReminder;

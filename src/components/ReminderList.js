import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { format } from 'date-fns';

const ReminderList = ({ reminders, onSendReminder, onUpdateStatus }) => {
    const getStatusBadge = (status) => {
        const variants = {
            PENDING: 'warning',
            PAID: 'success',
            OVERDUE: 'danger'
        };
        return (
            <Badge bg={variants[status] || 'secondary'}>
                {status}
            </Badge>
        );
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (date) => {
        return format(new Date(date), 'dd MMM yyyy');
    };

    return (
        <div className="modern-card">
            <h3 className="mb-3">Payment Reminders</h3>
            <div className="table-responsive">
                <Table hover>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Last Reminded</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reminders.map(reminder => (
                            <tr key={reminder.id}>
                                <td>
                                    <div>{reminder.customer_name}</div>
                                    <small className="text-muted">{reminder.customer_phone}</small>
                                </td>
                                <td>{formatAmount(reminder.amount)}</td>
                                <td>{formatDate(reminder.due_date)}</td>
                                <td>{getStatusBadge(reminder.payment_status)}</td>
                                <td>
                                    {reminder.last_reminded_at ? (
                                        <>
                                            {formatDate(reminder.last_reminded_at)}
                                            <br />
                                            <small className="text-muted">
                                                {reminder.reminder_count} reminder(s) sent
                                            </small>
                                        </>
                                    ) : (
                                        'Not reminded yet'
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        {reminder.payment_status !== 'PAID' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => onSendReminder(reminder.id)}
                                                >
                                                    Send Reminder
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => onUpdateStatus(reminder.id, 'PAID')}
                                                >
                                                    Mark Paid
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {reminders.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No reminders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default ReminderList;

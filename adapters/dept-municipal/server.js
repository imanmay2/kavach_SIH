const express = require('express');
const app = express();
const port = 4001;

// Graceful import of event-bus
let publishEvent = () => {};
try {
    const publisher = require('../../event-bus/publisher.js');
    if (publisher && publisher.publishEvent) {
        publishEvent = publisher.publishEvent;
    }
} catch (error) {
    console.warn('[Adapter] Warning: event-bus/publisher.js not found or invalid. Running in standalone mode.');
}

app.use(express.json());

// In-memory records
let records = [
    { id: 'MUN-1001', name: 'Ravi Kumar', project_type: 'Residential Construction', location: 'Andheri West, Mumbai', status: 'Approved' },
    { id: 'MUN-1002', name: 'Sneha Patel', project_type: 'Commercial Complex', location: 'Bandra East, Mumbai', status: 'Pending' },
    { id: 'MUN-1003', name: 'Amit Singh', project_type: 'Shop Renovation', location: 'Dadar, Mumbai', status: 'UnderReview' },
    { id: 'MUN-1004', name: 'Priya Sharma', project_type: 'Residential Construction', location: 'Juhu, Mumbai', status: 'Pending' },
    { id: 'MUN-1005', name: 'Vikram Joshi', project_type: 'Hospital Extension', location: 'Borivali, Mumbai', status: 'UnderReview' },
    { id: 'MUN-1006', name: 'Neha Gupta', project_type: 'School Building', location: 'Malad, Mumbai', status: 'Approved' }
];

app.post('/fetch_record', (req, res) => {
    // Envelope pattern matching Agents: { success: true, data: ... }
    res.json({ success: true, data: records });
});

app.post('/submit_record', (req, res) => {
    const { name, project_type, location } = req.body;
    
    if (!name || !project_type || !location) {
        // FastAPI standard error format: { detail: "..." } with appropriate HTTP status
        return res.status(400).json({ detail: 'Missing required fields (name, project_type, location)' });
    }

    const newId = `MUN-${1000 + records.length + 1}`;
    const newRecord = {
        id: newId,
        name,
        project_type,
        location,
        status: 'Pending'
    };
    
    records.push(newRecord);
    
    // Publish event
    try {
        publishEvent('RECORD_SUBMITTED', { department_id: 'municipal', record: newRecord });
    } catch (err) {
        console.error('[Adapter] Failed to publish event:', err.message);
    }

    // Success response wrapped in data envelope
    res.json({ success: true, data: { reference_id: newId, message: 'Record submitted successfully' } });
});

app.get('/status/:id', (req, res) => {
    const recordId = req.params.id;
    const record = records.find(r => r.id === recordId);
    
    if (!record) {
        return res.status(404).json({ detail: 'Record not found' });
    }

    const oldStatus = record.status;
    
    // Cycle the status
    if (record.status === 'Pending') {
        record.status = 'UnderReview';
    } else if (record.status === 'UnderReview') {
        record.status = 'Approved';
    }
    
    if (oldStatus !== record.status) {
        try {
            const now = new Date().toISOString();
            publishEvent('STATUS_CHANGED', { 
                department_id: 'municipal', 
                record_id: record.id, 
                old_status: oldStatus, 
                new_status: record.status,
                updated_at: now
            });
            
            if (record.status === 'Approved') {
                publishEvent('APPLICATION_APPROVED', {
                    department_id: 'municipal',
                    record_id: record.id,
                    approved_at: now,
                    remarks: 'Automatically approved'
                });
            } else if (record.status === 'Rejected') {
                publishEvent('APPLICATION_REJECTED', {
                    department_id: 'municipal',
                    record_id: record.id,
                    rejected_at: now,
                    reason: 'Automatically rejected'
                });
            }
        } catch (err) {
            console.error('[Adapter] Failed to publish event:', err.message);
        }
    }

    res.json({ success: true, data: { id: record.id, status: record.status } });
});

app.listen(port, () => {
    console.log(`Municipal Department mock adapter running on port ${port}`);
});

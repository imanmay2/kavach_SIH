const express = require('express');
const app = express();
const port = 4003;

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
    { id: 'POL-3001', name: 'ChemCorp India', project_type: 'Chemical Plant', location: 'Taloja MIDC', status: 'UnderReview' },
    { id: 'POL-3002', name: 'Sneha Patel', project_type: 'Commercial Complex', location: 'Bandra East, Mumbai', status: 'Approved' },
    { id: 'POL-3003', name: 'Textile Hub Ltd', project_type: 'Manufacturing Unit', location: 'Bhiwandi', status: 'Pending' },
    { id: 'POL-3004', name: 'Green Energy Solutions', project_type: 'Solar Panel Factory', location: 'Pune MIDC', status: 'Approved' },
    { id: 'POL-3005', name: 'Global Tech Park', project_type: 'IT Park', location: 'Navi Mumbai', status: 'Pending' },
    { id: 'POL-3006', name: 'AutoMakers Co', project_type: 'Automobile Assembly', location: 'Chakan MIDC', status: 'UnderReview' }
];

app.post('/fetch_record', (req, res) => {
    res.json({ success: true, data: records });
});

app.post('/submit_record', (req, res) => {
    const { name, project_type, location } = req.body;
    
    if (!name || !project_type || !location) {
        return res.status(400).json({ detail: 'Missing required fields (name, project_type, location)' });
    }

    const newId = `POL-${3000 + records.length + 1}`;
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
        publishEvent('RECORD_SUBMITTED', { department_id: 'pollution', record: newRecord });
    } catch (err) {
        console.error('[Adapter] Failed to publish event:', err.message);
    }

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
                department_id: 'pollution', 
                record_id: record.id, 
                old_status: oldStatus, 
                new_status: record.status,
                updated_at: now
            });
            
            if (record.status === 'Approved') {
                publishEvent('APPLICATION_APPROVED', {
                    department_id: 'pollution',
                    record_id: record.id,
                    approved_at: now,
                    remarks: 'Automatically approved'
                });
            } else if (record.status === 'Rejected') {
                publishEvent('APPLICATION_REJECTED', {
                    department_id: 'pollution',
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
    console.log(`Pollution Department mock adapter running on port ${port}`);
});

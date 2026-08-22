const express = require('express');
const app = express();
const port = 4002;

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
    { id: 'FIRE-2001', name: 'Ravi Kumar', project_type: 'Residential Construction', location: 'Andheri West, Mumbai', status: 'Pending' },
    { id: 'FIRE-2002', name: 'Sneha Patel', project_type: 'Commercial Complex', location: 'Bandra East, Mumbai', status: 'Approved' },
    { id: 'FIRE-2003', name: 'Amit Singh', project_type: 'Shop Renovation', location: 'Dadar, Mumbai', status: 'UnderReview' },
    { id: 'FIRE-2004', name: 'Global Tech Park', project_type: 'IT Park', location: 'Navi Mumbai', status: 'Pending' },
    { id: 'FIRE-2005', name: 'City Hospital', project_type: 'Hospital', location: 'South Mumbai', status: 'Approved' },
    { id: 'FIRE-2006', name: 'Orchid Mall', project_type: 'Commercial Mall', location: 'Thane', status: 'UnderReview' }
];

app.post('/fetch_record', (req, res) => {
    res.json({ success: true, data: records });
});

app.post('/submit_record', (req, res) => {
    const { name, project_type, location } = req.body;
    
    if (!name || !project_type || !location) {
        return res.status(400).json({ detail: 'Missing required fields (name, project_type, location)' });
    }

    const newId = `FIRE-${2000 + records.length + 1}`;
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
        publishEvent('RECORD_SUBMITTED', { department: 'fire-noc', record: newRecord });
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
            publishEvent('STATUS_CHANGED', { department: 'fire-noc', record_id: record.id, old_status: oldStatus, new_status: record.status });
        } catch (err) {
            console.error('[Adapter] Failed to publish event:', err.message);
        }
    }

    res.json({ success: true, data: { id: record.id, status: record.status } });
});

app.listen(port, () => {
    console.log(`Fire NOC Department mock adapter running on port ${port}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Basic auth for admin routes
const adminAuth = basicAuth({
    users: { 'admin': 'changeme' }, // Change these credentials in production
    challenge: true
});

// Data file path
const channelsFilePath = path.join(__dirname, 'data', 'channels.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize channels.json if it doesn't exist
if (!fs.existsSync(channelsFilePath)) {
    fs.writeFileSync(channelsFilePath, JSON.stringify({ channels: [] }));
}

// API Routes
app.get('/api/channels', (req, res) => {
    const data = JSON.parse(fs.readFileSync(channelsFilePath));
    res.json(data.channels);
});

app.post('/api/channels', adminAuth, (req, res) => {
    const { name, link, description, category } = req.body;
    
    if (!name || !link) {
        return res.status(400).json({ error: 'Name and link are required' });
    }

    const data = JSON.parse(fs.readFileSync(channelsFilePath));
    const categories = category ? category.split(',').map(cat => cat.trim()).filter(Boolean) : [];
    data.channels.push({ name, link, description, categories });
    fs.writeFileSync(channelsFilePath, JSON.stringify(data, null, 2));
    
    res.json({ message: 'Channel added successfully' });
});

app.put('/api/channels/:index', adminAuth, (req, res) => {
    const index = parseInt(req.params.index);
    const { name, link, description, category } = req.body;
    
    if (!name || !link) {
        return res.status(400).json({ error: 'Name and link are required' });
    }

    const data = JSON.parse(fs.readFileSync(channelsFilePath));
    
    if (index >= 0 && index < data.channels.length) {
        const categories = category ? category.split(',').map(cat => cat.trim()).filter(Boolean) : [];
        data.channels[index] = { name, link, description, categories };
        fs.writeFileSync(channelsFilePath, JSON.stringify(data, null, 2));
        res.json({ message: 'Channel updated successfully' });
    } else {
        res.status(404).json({ error: 'Channel not found' });
    }
});

app.delete('/api/channels/:index', adminAuth, (req, res) => {
    const index = parseInt(req.params.index);
    const data = JSON.parse(fs.readFileSync(channelsFilePath));
    
    if (index >= 0 && index < data.channels.length) {
        data.channels.splice(index, 1);
        fs.writeFileSync(channelsFilePath, JSON.stringify(data, null, 2));
        res.json({ message: 'Channel deleted successfully' });
    } else {
        res.status(404).json({ error: 'Channel not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
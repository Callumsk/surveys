const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS for production
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Data storage (in production, use a proper database)
let surveys = [];
let files = {};

// Load initial data if exists
const dataFile = path.join(__dirname, 'data.json');
if (fs.existsSync(dataFile)) {
    try {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        surveys = data.surveys || [];
        files = data.files || {};
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to file
function saveData() {
    try {
        fs.writeFileSync(dataFile, JSON.stringify({ surveys, files }, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Broadcast to all connected clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`New client connected from ${clientIP}`);
    
    // Send current data to new client
    ws.send(JSON.stringify({
        type: 'initial',
        data: { surveys, files }
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'update_surveys':
                    surveys = data.surveys;
                    saveData();
                    broadcast({
                        type: 'surveys_updated',
                        surveys: surveys
                    });
                    break;
                    
                case 'update_files':
                    files = data.files;
                    saveData();
                    broadcast({
                        type: 'files_updated',
                        files: files
                    });
                    break;
                    
                case 'add_survey':
                    surveys.push(data.survey);
                    saveData();
                    broadcast({
                        type: 'survey_added',
                        survey: data.survey
                    });
                    break;
                    
                case 'update_survey':
                    const surveyIndex = surveys.findIndex(s => s.id === data.survey.id);
                    if (surveyIndex !== -1) {
                        surveys[surveyIndex] = data.survey;
                        saveData();
                        broadcast({
                            type: 'survey_updated',
                            survey: data.survey
                        });
                    }
                    break;
                    
                case 'delete_survey':
                    surveys = surveys.filter(s => s.id !== data.surveyId);
                    if (files[data.surveyId]) {
                        delete files[data.surveyId];
                    }
                    saveData();
                    broadcast({
                        type: 'survey_deleted',
                        surveyId: data.surveyId
                    });
                    break;
                    
                case 'add_file':
                    if (!files[data.file.surveyId]) {
                        files[data.file.surveyId] = [];
                    }
                    files[data.file.surveyId].push(data.file);
                    saveData();
                    broadcast({
                        type: 'file_added',
                        file: data.file
                    });
                    break;
                    
                case 'delete_file':
                    if (files[data.surveyId]) {
                        files[data.surveyId] = files[data.surveyId].filter(f => f.id !== data.fileId);
                        saveData();
                        broadcast({
                            type: 'file_deleted',
                            surveyId: data.surveyId,
                            fileId: data.fileId
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected from ${clientIP}`);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error from ${clientIP}:`, error);
    });
});

// REST API endpoints for fallback
app.get('/api/surveys', (req, res) => {
    res.json(surveys);
});

app.get('/api/files', (req, res) => {
    res.json(files);
});

app.post('/api/surveys', (req, res) => {
    const survey = req.body;
    surveys.push(survey);
    saveData();
    broadcast({
        type: 'survey_added',
        survey: survey
    });
    res.json(survey);
});

app.put('/api/surveys/:id', (req, res) => {
    const { id } = req.params;
    const surveyIndex = surveys.findIndex(s => s.id === id);
    if (surveyIndex !== -1) {
        surveys[surveyIndex] = req.body;
        saveData();
        broadcast({
            type: 'survey_updated',
            survey: req.body
        });
        res.json(req.body);
    } else {
        res.status(404).json({ error: 'Survey not found' });
    }
});

app.delete('/api/surveys/:id', (req, res) => {
    const { id } = req.params;
    surveys = surveys.filter(s => s.id !== id);
    if (files[id]) {
        delete files[id];
    }
    saveData();
    broadcast({
        type: 'survey_deleted',
        surveyId: id
    });
    res.json({ success: true });
});

// Handle all other routes by serving the main HTML file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://${HOST}:${PORT}`);
    console.log(`🔌 WebSocket: ws://${HOST}:${PORT}`);
    
    if (process.env.NODE_ENV === 'production') {
        console.log(`✅ Production mode enabled`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

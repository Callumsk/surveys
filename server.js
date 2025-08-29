const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use(express.json());

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
wss.on('connection', (ws) => {
    console.log('New client connected');
    
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
        console.log('Client disconnected');
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

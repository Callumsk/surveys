// ECO4 Survey Management System with Real-time WebSocket Support
class SurveyManager {
    constructor() {
        this.surveys = [];
        this.currentSurveyId = null;
        this.currentFiles = [];
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }

    init() {
        this.connectWebSocket();
        this.setupEventListeners();
        this.renderSurveys();
        this.updateStats();
    }

    // WebSocket Connection Management
    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus(true);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.isConnected = false;
            this.updateConnectionStatus(false);
        };
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectWebSocket();
            }, 2000 * this.reconnectAttempts); // Exponential backoff
        } else {
            console.error('Max reconnection attempts reached');
            this.showConnectionError();
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) {
            // Create status element if it doesn't exist
            const header = document.querySelector('.header');
            const statusDiv = document.createElement('div');
            statusDiv.id = 'connectionStatus';
            statusDiv.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
            `;
            header.appendChild(statusDiv);
        }

        const statusElement = document.getElementById('connectionStatus');
        if (connected) {
            statusElement.innerHTML = `
                <div style="width: 8px; height: 8px; background: #27ae60; border-radius: 50%;"></div>
                <span style="color: #27ae60;">Connected</span>
            `;
        } else {
            statusElement.innerHTML = `
                <div style="width: 8px; height: 8px; background: #e74c3c; border-radius: 50%;"></div>
                <span style="color: #e74c3c;">Disconnected</span>
            `;
        }
    }

    showConnectionError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.innerHTML = `
            <strong>Connection Error</strong><br>
            Unable to connect to server. Please refresh the page.
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'initial':
                this.surveys = data.data.surveys || [];
                this.files = data.data.files || {};
                this.renderSurveys();
                this.updateStats();
                break;
                
            case 'surveys_updated':
                this.surveys = data.surveys;
                this.renderSurveys();
                this.updateStats();
                break;
                
            case 'files_updated':
                this.files = data.files;
                this.renderSurveys();
                this.updateStats();
                break;
                
            case 'survey_added':
                this.surveys.push(data.survey);
                this.renderSurveys();
                this.updateStats();
                this.showNotification('Survey added successfully');
                break;
                
            case 'survey_updated':
                const surveyIndex = this.surveys.findIndex(s => s.id === data.survey.id);
                if (surveyIndex !== -1) {
                    this.surveys[surveyIndex] = data.survey;
                    this.renderSurveys();
                    this.updateStats();
                    this.showNotification('Survey updated successfully');
                }
                break;
                
            case 'survey_deleted':
                this.surveys = this.surveys.filter(s => s.id !== data.surveyId);
                if (this.files[data.surveyId]) {
                    delete this.files[data.surveyId];
                }
                this.renderSurveys();
                this.updateStats();
                this.showNotification('Survey deleted successfully');
                break;
                
            case 'file_added':
                if (!this.files[data.file.surveyId]) {
                    this.files[data.file.surveyId] = [];
                }
                this.files[data.file.surveyId].push(data.file);
                this.renderSurveys();
                this.updateStats();
                if (this.currentSurveyId === data.file.surveyId) {
                    this.updateCurrentFilesList();
                }
                this.showNotification('File uploaded successfully');
                break;
                
            case 'file_deleted':
                if (this.files[data.surveyId]) {
                    this.files[data.surveyId] = this.files[data.surveyId].filter(f => f.id !== data.fileId);
                    this.renderSurveys();
                    this.updateStats();
                    if (this.currentSurveyId === data.surveyId) {
                        this.updateCurrentFilesList();
                    }
                    this.showNotification('File deleted successfully');
                }
                break;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Send WebSocket message
    sendWebSocketMessage(type, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        } else {
            console.error('WebSocket is not connected');
            this.showConnectionError();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Add Survey Button
        document.getElementById('addSurveyBtn').addEventListener('click', () => {
            this.openSurveyModal();
        });

        // Modal Close Buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Survey Form
        document.getElementById('surveyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSurvey();
        });

        // Cancel Buttons
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeSurveyModal();
        });

        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.renderSurveys();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.renderSurveys();
        });

        // File Upload
        this.setupFileUpload();

        // Confirmation Modal
        document.getElementById('confirmAction').addEventListener('click', () => {
            this.executeConfirmedAction();
        });

        document.getElementById('cancelConfirm').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const uploadedFiles = document.getElementById('uploadedFiles');

        // Click to upload
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.style.background = '#e3f2fd';
            fileUploadArea.style.borderColor = '#2980b9';
        });

        fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadArea.style.background = '#f8f9fa';
            fileUploadArea.style.borderColor = '#3498db';
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.style.background = '#f8f9fa';
            fileUploadArea.style.borderColor = '#3498db';
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFileUpload(files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileUpload(files);
        });
    }

    handleFileUpload(files) {
        const uploadedFiles = document.getElementById('uploadedFiles');
        
        files.forEach(file => {
            const fileId = this.generateId();
            const fileData = {
                id: fileId,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                surveyId: this.currentSurveyId
            };

            // Send to server via WebSocket
            this.sendWebSocketMessage('add_file', { file: fileData });

            // Display uploaded file
            const fileElement = this.createFileElement(fileData);
            uploadedFiles.appendChild(fileElement);
        });

        this.updateCurrentFilesList();
    }

    createFileElement(fileData) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'uploaded-file';
        fileDiv.innerHTML = `
            <div>
                <i class="fas fa-file"></i>
                <span>${fileData.name}</span>
                <small>(${this.formatFileSize(fileData.size)})</small>
            </div>
            <button class="btn btn-danger" onclick="surveyManager.removeFile('${fileData.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        return fileDiv;
    }

    removeFile(fileId) {
        if (this.currentSurveyId && this.files[this.currentSurveyId]) {
            this.sendWebSocketMessage('delete_file', {
                surveyId: this.currentSurveyId,
                fileId: fileId
            });
        }
    }

    updateCurrentFilesList() {
        const currentFilesList = document.getElementById('currentFilesList');
        const surveyFiles = this.files[this.currentSurveyId] || [];
        
        if (surveyFiles.length === 0) {
            currentFilesList.innerHTML = '<p>No files uploaded yet.</p>';
            return;
        }

        currentFilesList.innerHTML = surveyFiles.map(file => `
            <div class="file-item">
                <div>
                    <i class="fas fa-file"></i>
                    <span>${file.name}</span>
                    <small>(${this.formatFileSize(file.size)})</small>
                </div>
                <button class="btn btn-danger" onclick="surveyManager.removeFile('${file.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Survey Management
    openSurveyModal(surveyId = null) {
        this.currentSurveyId = surveyId;
        const modal = document.getElementById('surveyModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('surveyForm');

        if (surveyId) {
            const survey = this.surveys.find(s => s.id === surveyId);
            if (survey) {
                modalTitle.textContent = 'Edit Survey';
                this.populateForm(survey);
            }
        } else {
            modalTitle.textContent = 'Add New Survey';
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeSurveyModal() {
        document.getElementById('surveyModal').style.display = 'none';
        document.getElementById('surveyForm').reset();
        this.currentSurveyId = null;
    }

    populateForm(survey) {
        document.getElementById('surveyTitle').value = survey.title;
        document.getElementById('customerName').value = survey.customerName;
        document.getElementById('customerAddress').value = survey.customerAddress;
        document.getElementById('customerPhone').value = survey.customerPhone || '';
        document.getElementById('customerEmail').value = survey.customerEmail || '';
        document.getElementById('surveyStatus').value = survey.status;
        document.getElementById('surveyNotes').value = survey.notes || '';
    }

    saveSurvey() {
        const formData = {
            title: document.getElementById('surveyTitle').value,
            customerName: document.getElementById('customerName').value,
            customerAddress: document.getElementById('customerAddress').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerEmail: document.getElementById('customerEmail').value,
            status: document.getElementById('surveyStatus').value,
            notes: document.getElementById('surveyNotes').value,
            lastUpdated: new Date().toISOString()
        };

        if (this.currentSurveyId) {
            // Update existing survey
            const index = this.surveys.findIndex(s => s.id === this.currentSurveyId);
            if (index !== -1) {
                formData.id = this.currentSurveyId;
                formData.createdDate = this.surveys[index].createdDate;
                this.sendWebSocketMessage('update_survey', { survey: formData });
            }
        } else {
            // Add new survey
            formData.id = this.generateId();
            formData.createdDate = new Date().toISOString();
            this.sendWebSocketMessage('add_survey', { survey: formData });
        }

        this.closeSurveyModal();
    }

    deleteSurvey(surveyId) {
        this.showConfirmModal(
            'Are you sure you want to delete this survey? This action cannot be undone.',
            () => {
                this.sendWebSocketMessage('delete_survey', { surveyId: surveyId });
                this.closeConfirmModal();
            }
        );
    }

    changeStatus(surveyId, newStatus) {
        const survey = this.surveys.find(s => s.id === surveyId);
        if (survey) {
            survey.status = newStatus;
            survey.lastUpdated = new Date().toISOString();
            this.sendWebSocketMessage('update_survey', { survey: survey });
        }
    }

    openFileModal(surveyId) {
        this.currentSurveyId = surveyId;
        const modal = document.getElementById('fileModal');
        modal.style.display = 'block';
        this.updateCurrentFilesList();
        
        // Clear uploaded files display
        document.getElementById('uploadedFiles').innerHTML = '';
    }

    closeFileModal() {
        document.getElementById('fileModal').style.display = 'none';
        this.currentSurveyId = null;
    }

    // Confirmation Modal
    showConfirmModal(message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
        this.confirmCallback = callback;
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.confirmCallback = null;
    }

    executeConfirmedAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Rendering
    renderSurveys() {
        const container = document.getElementById('surveysContainer');
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        let filteredSurveys = this.surveys;

        // Apply status filter
        if (statusFilter !== 'all') {
            filteredSurveys = filteredSurveys.filter(survey => survey.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm) {
            filteredSurveys = filteredSurveys.filter(survey =>
                survey.title.toLowerCase().includes(searchTerm) ||
                survey.customerName.toLowerCase().includes(searchTerm) ||
                survey.customerAddress.toLowerCase().includes(searchTerm)
            );
        }

        if (filteredSurveys.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No surveys found</h3>
                    <p>${this.surveys.length === 0 ? 'Create your first survey to get started!' : 'Try adjusting your filters or search terms.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredSurveys.map(survey => this.createSurveyCard(survey)).join('');
    }

    createSurveyCard(survey) {
        const fileCount = this.files[survey.id] ? this.files[survey.id].length : 0;
        const statusClass = `status-${survey.status.replace('-', '-')}`;
        
        return `
            <div class="survey-card ${survey.status}">
                <div class="survey-header">
                    <div>
                        <div class="survey-title">${survey.title}</div>
                        <div class="survey-status ${statusClass}">${survey.status.replace('-', ' ')}</div>
                    </div>
                    <div class="survey-actions">
                        <button class="btn btn-primary" onclick="surveyManager.openSurveyModal('${survey.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-success" onclick="surveyManager.openFileModal('${survey.id}')">
                            <i class="fas fa-file-upload"></i> Files (${fileCount})
                        </button>
                        <button class="btn btn-warning" onclick="surveyManager.changeStatus('${survey.id}', '${this.getNextStatus(survey.status)}')">
                            <i class="fas fa-arrow-right"></i> ${this.getNextStatusLabel(survey.status)}
                        </button>
                        <button class="btn btn-danger" onclick="surveyManager.deleteSurvey('${survey.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="survey-info">
                    <div class="info-item">
                        <div class="info-label">Customer Name</div>
                        <div class="info-value">${survey.customerName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Address</div>
                        <div class="info-value">${survey.customerAddress}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${survey.customerPhone || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${survey.customerEmail || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Created</div>
                        <div class="info-value">${this.formatDate(survey.createdDate)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Last Updated</div>
                        <div class="info-value">${this.formatDate(survey.lastUpdated)}</div>
                    </div>
                </div>
                ${survey.notes ? `
                    <div class="info-item">
                        <div class="info-label">Notes</div>
                        <div class="info-value">${survey.notes}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getNextStatus(currentStatus) {
        const statusFlow = {
            'pending': 'in-progress',
            'in-progress': 'completed',
            'completed': 'completed',
            'cancelled': 'cancelled'
        };
        return statusFlow[currentStatus] || 'pending';
    }

    getNextStatusLabel(currentStatus) {
        const statusLabels = {
            'pending': 'Start',
            'in-progress': 'Complete',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusLabels[currentStatus] || 'Start';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updateStats() {
        const totalSurveys = this.surveys.length;
        const pendingSurveys = this.surveys.filter(s => s.status === 'pending').length;
        const completedSurveys = this.surveys.filter(s => s.status === 'completed').length;
        const totalFiles = Object.values(this.files).reduce((total, files) => total + files.length, 0);

        document.getElementById('totalSurveys').textContent = totalSurveys;
        document.getElementById('pendingSurveys').textContent = pendingSurveys;
        document.getElementById('completedSurveys').textContent = completedSurveys;
        document.getElementById('totalFiles').textContent = totalFiles;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
const surveyManager = new SurveyManager();

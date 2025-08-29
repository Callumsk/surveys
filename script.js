// ECO4 Survey Management System - Simplified Version
class SurveyManager {
    constructor() {
        this.surveys = [];
        this.files = {};
        this.currentSurveyId = null;
        this.confirmCallback = null;
        this.init();
    }

    init() {
        console.log('Initializing SurveyManager...');
        this.loadLocalData();
        this.setupEventListeners();
        this.renderSurveys();
        this.updateStats();
        console.log('SurveyManager initialized successfully!');
    }

    // Load data from localStorage
    loadLocalData() {
        try {
            const savedSurveys = localStorage.getItem('eco4_surveys');
            const savedFiles = localStorage.getItem('eco4_files');
            
            if (savedSurveys) {
                this.surveys = JSON.parse(savedSurveys);
                console.log('Loaded surveys from localStorage:', this.surveys.length);
            }
            if (savedFiles) {
                this.files = JSON.parse(savedFiles);
                console.log('Loaded files from localStorage for', Object.keys(this.files).length, 'surveys');
            }
        } catch (error) {
            console.log('No local data found or error loading data:', error);
        }
    }

    // Save data to localStorage
    saveLocalData() {
        try {
            localStorage.setItem('eco4_surveys', JSON.stringify(this.surveys));
            localStorage.setItem('eco4_files', JSON.stringify(this.files));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Event Listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Add Survey Button
        const addSurveyBtn = document.getElementById('addSurveyBtn');
        if (addSurveyBtn) {
            console.log('Found add survey button, adding event listener');
            addSurveyBtn.addEventListener('click', () => {
                console.log('Add survey button clicked!');
                this.openSurveyModal();
            });
        } else {
            console.error('Add survey button not found!');
        }

        // Modal Close Buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                console.log('Close button clicked');
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Survey Form
        const surveyForm = document.getElementById('surveyForm');
        if (surveyForm) {
            console.log('Found survey form, adding event listener');
            surveyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Survey form submitted');
                this.saveSurvey();
            });
        } else {
            console.error('Survey form not found!');
        }

        // Cancel Buttons
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                console.log('Cancel button clicked');
                this.closeSurveyModal();
            });
        }

        // Close File Modal Button
        const closeFileModalBtn = document.getElementById('closeFileModal');
        if (closeFileModalBtn) {
            closeFileModalBtn.addEventListener('click', () => {
                this.closeFileModal();
            });
        }

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.renderSurveys();
            });
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderSurveys();
            });
        }

        // File Upload
        this.setupFileUpload();

        // Confirmation Modal
        const confirmActionBtn = document.getElementById('confirmAction');
        if (confirmActionBtn) {
            confirmActionBtn.addEventListener('click', () => {
                this.executeConfirmedAction();
            });
        }

        const cancelConfirmBtn = document.getElementById('cancelConfirm');
        if (cancelConfirmBtn) {
            cancelConfirmBtn.addEventListener('click', () => {
                this.closeConfirmModal();
            });
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        console.log('Event listeners setup complete');
    }

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');

        if (fileUploadArea && fileInput) {
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

            // Add to files object
            if (!this.files[this.currentSurveyId]) {
                this.files[this.currentSurveyId] = [];
            }
            this.files[this.currentSurveyId].push(fileData);
            this.saveLocalData();

            // Display uploaded file
            const fileElement = this.createFileElement(fileData);
            if (uploadedFiles) {
                uploadedFiles.appendChild(fileElement);
            }
        });

        this.updateCurrentFilesList();
        this.renderSurveys();
        this.updateStats();
        this.showNotification('File uploaded successfully');
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
            this.files[this.currentSurveyId] = this.files[this.currentSurveyId].filter(f => f.id !== fileId);
            this.saveLocalData();
            this.renderSurveys();
            this.updateStats();
            this.updateCurrentFilesList();
            this.showNotification('File deleted successfully');
        }
    }

    updateCurrentFilesList() {
        const currentFilesList = document.getElementById('currentFilesList');
        if (!currentFilesList) return;
        
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
        console.log('Opening survey modal for:', surveyId);
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
            if (form) form.reset();
        }

        if (modal) {
            modal.style.display = 'block';
            console.log('Modal displayed');
        } else {
            console.error('Modal not found!');
        }
    }

    closeSurveyModal() {
        const modal = document.getElementById('surveyModal');
        const form = document.getElementById('surveyForm');
        
        if (modal) modal.style.display = 'none';
        if (form) form.reset();
        this.currentSurveyId = null;
        console.log('Survey modal closed');
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
        console.log('Saving survey...');
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
                this.surveys[index] = formData;
            }
        } else {
            // Add new survey
            formData.id = this.generateId();
            formData.createdDate = new Date().toISOString();
            this.surveys.push(formData);
        }

        this.saveLocalData();
        this.renderSurveys();
        this.updateStats();
        this.showNotification(this.currentSurveyId ? 'Survey updated successfully' : 'Survey added successfully');
        this.closeSurveyModal();
    }

    deleteSurvey(surveyId) {
        this.showConfirmModal(
            'Are you sure you want to delete this survey? This action cannot be undone.',
            () => {
                this.surveys = this.surveys.filter(s => s.id !== surveyId);
                if (this.files[surveyId]) {
                    delete this.files[surveyId];
                }
                this.saveLocalData();
                this.renderSurveys();
                this.updateStats();
                this.showNotification('Survey deleted successfully');
                this.closeConfirmModal();
            }
        );
    }

    changeStatus(surveyId, newStatus) {
        const survey = this.surveys.find(s => s.id === surveyId);
        if (survey) {
            survey.status = newStatus;
            survey.lastUpdated = new Date().toISOString();
            this.saveLocalData();
            this.renderSurveys();
            this.updateStats();
            this.showNotification('Status updated successfully');
        }
    }

    openFileModal(surveyId) {
        console.log('Opening file modal for survey:', surveyId);
        this.currentSurveyId = surveyId;
        const modal = document.getElementById('fileModal');
        
        if (modal) {
            modal.style.display = 'block';
            this.updateCurrentFilesList();
            
            // Clear uploaded files display
            const uploadedFiles = document.getElementById('uploadedFiles');
            if (uploadedFiles) {
                uploadedFiles.innerHTML = '';
            }
        }
    }

    closeFileModal() {
        const modal = document.getElementById('fileModal');
        if (modal) modal.style.display = 'none';
        this.currentSurveyId = null;
    }

    // Confirmation Modal
    showConfirmModal(message, callback) {
        const modal = document.getElementById('confirmModal');
        const messageElement = document.getElementById('confirmMessage');
        
        if (messageElement) messageElement.textContent = message;
        if (modal) modal.style.display = 'block';
        this.confirmCallback = callback;
    }

    closeConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.style.display = 'none';
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

    // Rendering
    renderSurveys() {
        const container = document.getElementById('surveysContainer');
        if (!container) return;
        
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchInput');
        
        const statusFilterValue = statusFilter ? statusFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        let filteredSurveys = this.surveys;

        // Apply status filter
        if (statusFilterValue !== 'all') {
            filteredSurveys = filteredSurveys.filter(survey => survey.status === statusFilterValue);
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

        const totalSurveysElement = document.getElementById('totalSurveys');
        const pendingSurveysElement = document.getElementById('pendingSurveys');
        const completedSurveysElement = document.getElementById('completedSurveys');
        const totalFilesElement = document.getElementById('totalFiles');

        if (totalSurveysElement) totalSurveysElement.textContent = totalSurveys;
        if (pendingSurveysElement) pendingSurveysElement.textContent = pendingSurveys;
        if (completedSurveysElement) completedSurveysElement.textContent = completedSurveys;
        if (totalFilesElement) totalFilesElement.textContent = totalFiles;
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
console.log('Initializing ECO4 Survey Management System...');
const surveyManager = new SurveyManager();
console.log('Application initialized successfully!');

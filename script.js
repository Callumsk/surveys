// ECO4 Survey Management System
class SurveyManager {
    constructor() {
        this.surveys = [];
        this.currentSurveyId = null;
        this.currentFiles = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderSurveys();
        this.updateStats();
        this.setupStorageListener();
    }

    // Data Management
    loadData() {
        const savedSurveys = localStorage.getItem('eco4_surveys');
        const savedFiles = localStorage.getItem('eco4_files');
        
        this.surveys = savedSurveys ? JSON.parse(savedSurveys) : [];
        this.files = savedFiles ? JSON.parse(savedFiles) : {};
    }

    saveData() {
        localStorage.setItem('eco4_surveys', JSON.stringify(this.surveys));
        localStorage.setItem('eco4_files', JSON.stringify(this.files));
        
        // Trigger custom event for real-time updates
        window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: { surveys: this.surveys, files: this.files }
        }));
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'eco4_surveys' || e.key === 'eco4_files') {
                this.loadData();
                this.renderSurveys();
                this.updateStats();
            }
        });

        window.addEventListener('dataUpdated', () => {
            this.loadData();
            this.renderSurveys();
            this.updateStats();
        });
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

            // Store file data
            if (!this.files[this.currentSurveyId]) {
                this.files[this.currentSurveyId] = [];
            }
            this.files[this.currentSurveyId].push(fileData);

            // Display uploaded file
            const fileElement = this.createFileElement(fileData);
            uploadedFiles.appendChild(fileElement);
        });

        this.saveData();
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
            this.files[this.currentSurveyId] = this.files[this.currentSurveyId].filter(
                file => file.id !== fileId
            );
            this.saveData();
            this.updateCurrentFilesList();
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
                this.surveys[index] = { ...this.surveys[index], ...formData };
            }
        } else {
            // Add new survey
            formData.id = this.generateId();
            formData.createdDate = new Date().toISOString();
            this.surveys.push(formData);
        }

        this.saveData();
        this.closeSurveyModal();
    }

    deleteSurvey(surveyId) {
        this.showConfirmModal(
            'Are you sure you want to delete this survey? This action cannot be undone.',
            () => {
                this.surveys = this.surveys.filter(s => s.id !== surveyId);
                delete this.files[surveyId];
                this.saveData();
                this.closeConfirmModal();
            }
        );
    }

    changeStatus(surveyId, newStatus) {
        const survey = this.surveys.find(s => s.id === surveyId);
        if (survey) {
            survey.status = newStatus;
            survey.lastUpdated = new Date().toISOString();
            this.saveData();
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

// Initialize the application
const surveyManager = new SurveyManager();

// Add some sample data for demonstration
if (surveyManager.surveys.length === 0) {
    const sampleSurveys = [
        {
            id: '1',
            title: 'ECO4 Home Energy Assessment',
            customerName: 'John Smith',
            customerAddress: '123 Main Street, London, SW1A 1AA',
            customerPhone: '020 7123 4567',
            customerEmail: 'john.smith@email.com',
            status: 'pending',
            notes: 'Initial assessment required for ECO4 grant eligibility',
            createdDate: new Date(Date.now() - 86400000).toISOString(),
            lastUpdated: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '2',
            title: 'Solar Panel Installation Survey',
            customerName: 'Sarah Johnson',
            customerAddress: '456 Oak Avenue, Manchester, M1 1AA',
            customerPhone: '0161 123 4567',
            customerEmail: 'sarah.johnson@email.com',
            status: 'in-progress',
            notes: 'Roof assessment completed, awaiting structural survey',
            createdDate: new Date(Date.now() - 172800000).toISOString(),
            lastUpdated: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: '3',
            title: 'Insulation Upgrade Project',
            customerName: 'Michael Brown',
            customerAddress: '789 Pine Road, Birmingham, B1 1AA',
            customerPhone: '0121 123 4567',
            customerEmail: 'michael.brown@email.com',
            status: 'completed',
            notes: 'All work completed successfully. Customer satisfied with results.',
            createdDate: new Date(Date.now() - 259200000).toISOString(),
            lastUpdated: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    surveyManager.surveys = sampleSurveys;
    surveyManager.saveData();
}

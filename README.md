# ECO4 Survey Management System

A modern, responsive web application for managing ECO4 grant surveys with real-time data synchronization and file management capabilities.

## Features

### 🏠 Survey Management
- **Add New Surveys**: Create surveys with customer details, addresses, and notes
- **Edit Surveys**: Modify existing survey information
- **Delete Surveys**: Remove surveys with confirmation
- **Status Management**: Track survey progress (Pending → In Progress → Completed)
- **Search & Filter**: Find surveys by status or search terms

### 📁 File Management
- **Upload Files**: Drag & drop or click to upload files for each survey
- **File Types**: Supports PDF, DOC, DOCX, JPG, JPEG, PNG
- **File Organization**: Files are organized by survey
- **File Removal**: Delete individual files as needed

### 📊 Real-time Updates
- **Multi-instance Support**: Multiple browser tabs/windows stay synchronized
- **Local Storage**: Data persists between sessions
- **Live Updates**: Changes appear instantly across all instances

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful Interface**: Modern gradient design with smooth animations
- **Intuitive Navigation**: Easy-to-use interface with clear actions
- **Status Indicators**: Color-coded status badges and progress tracking

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Download all files to a folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`

2. Open `index.html` in your web browser

3. The application will load with sample data for demonstration

## Usage

### Adding a New Survey
1. Click the "Add New Survey" button
2. Fill in the required fields:
   - Survey Title
   - Customer Name
   - Customer Address
   - Status (Pending, In Progress, Completed, Cancelled)
3. Optionally add:
   - Customer Phone
   - Customer Email
   - Notes
4. Click "Save Survey"

### Managing Survey Status
- Use the status progression button to move surveys through stages:
  - **Pending** → **In Progress** → **Completed**
- Or manually edit the status in the survey form

### Uploading Files
1. Click the "Files" button on any survey
2. Drag and drop files into the upload area or click to browse
3. Files will be associated with that specific survey
4. View and manage uploaded files in the same modal

### Searching and Filtering
- Use the status dropdown to filter by survey status
- Use the search box to find surveys by title, customer name, or address
- Filters work together for precise results

### Real-time Synchronization
- Open multiple browser tabs/windows with the application
- Changes made in one instance will automatically appear in others
- Data is stored locally and persists between browser sessions

## Data Storage

The application uses browser localStorage for data persistence:
- **eco4_surveys**: Stores all survey information
- **eco4_files**: Stores file metadata and organization

### Data Structure

#### Survey Object
```javascript
{
  id: "unique_id",
  title: "Survey Title",
  customerName: "Customer Name",
  customerAddress: "Full Address",
  customerPhone: "Phone Number",
  customerEmail: "Email Address",
  status: "pending|in-progress|completed|cancelled",
  notes: "Additional notes",
  createdDate: "ISO date string",
  lastUpdated: "ISO date string"
}
```

#### File Object
```javascript
{
  id: "unique_file_id",
  name: "filename.pdf",
  size: 1024,
  type: "application/pdf",
  uploadDate: "ISO date string",
  surveyId: "survey_id"
}
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Security Notes

- All data is stored locally in the browser
- No data is sent to external servers
- File uploads are processed locally (files are not actually stored, only metadata)
- For production use, consider implementing proper server-side storage

## Customization

### Styling
Modify `styles.css` to customize:
- Colors and gradients
- Layout and spacing
- Typography
- Responsive breakpoints

### Functionality
Extend `script.js` to add:
- Additional survey fields
- Export functionality
- Advanced filtering
- Data backup/restore

## Troubleshooting

### Data Not Persisting
- Ensure localStorage is enabled in your browser
- Check browser privacy settings
- Clear browser cache if needed

### Files Not Uploading
- Check file type restrictions
- Ensure browser supports File API
- Try refreshing the page

### Real-time Updates Not Working
- Ensure all instances are on the same domain
- Check browser storage event support
- Refresh the page if synchronization issues occur

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure all files are in the same directory
3. Try opening in a different browser
4. Clear browser cache and localStorage if needed

---

**Note**: This is a client-side application designed for local use. For multi-user environments or production deployments, consider implementing server-side storage and user authentication.

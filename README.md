# ECO4 Survey Management System

A modern, responsive web application for managing ECO4 grant surveys with **real-time data synchronization** across multiple users using WebSocket technology.

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

### ⚡ Real-time Multi-User Updates
- **Live Synchronization**: Changes appear instantly across all connected users
- **WebSocket Technology**: Fast, efficient real-time communication
- **Connection Status**: Visual indicator showing connection status
- **Auto-reconnection**: Automatically reconnects if connection is lost
- **Notifications**: Real-time notifications for all actions

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful Interface**: Modern gradient design with smooth animations
- **Intuitive Navigation**: Easy-to-use interface with clear actions
- **Status Indicators**: Color-coded status badges and progress tracking

## Getting Started

### Prerequisites
- **Node.js** (version 14.0.0 or higher)
- **npm** (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or download** all files to a folder:
   ```
   index.html
   styles.css
   script.js
   server.js
   package.json
   README.md
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Development Mode
For development with auto-restart on file changes:
```bash
npm run dev
```

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

### Real-time Multi-User Features
- **Multiple Users**: Multiple users can access the application simultaneously
- **Live Updates**: Changes made by any user appear instantly for all others
- **Connection Status**: Green dot indicates connected, red dot indicates disconnected
- **Notifications**: Real-time notifications for all actions (add, edit, delete, upload)
- **Auto-reconnection**: Automatically reconnects if connection is lost

## Data Storage

The application uses a combination of:
- **Server-side storage**: Data is stored in `data.json` file on the server
- **WebSocket communication**: Real-time updates between all connected clients
- **Persistent data**: Data persists between server restarts

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

## Server Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)

### Production Deployment
For production deployment, consider:
1. **Database**: Replace file storage with a proper database (MongoDB, PostgreSQL, etc.)
2. **HTTPS**: Use HTTPS for secure WebSocket connections
3. **Load Balancing**: Use a load balancer for multiple server instances
4. **Environment Variables**: Configure production environment variables

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Security Notes

- **WebSocket Security**: Ensure proper authentication for production use
- **File Uploads**: Currently stores file metadata only (not actual files)
- **Data Validation**: Implement proper input validation for production
- **HTTPS**: Use HTTPS in production for secure connections

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
- User authentication

### Server
Modify `server.js` to add:
- Database integration
- User authentication
- File upload handling
- API rate limiting

## Troubleshooting

### Server Won't Start
- Ensure Node.js is installed (version 14+)
- Check if port 3000 is available
- Run `npm install` to install dependencies

### Connection Issues
- Check if server is running on correct port
- Ensure firewall allows connections
- Check browser console for WebSocket errors

### Real-time Updates Not Working
- Verify WebSocket connection status (green dot)
- Check server logs for errors
- Ensure all users are on the same server instance

### Data Not Persisting
- Check if `data.json` file is writable
- Verify server has write permissions
- Check server logs for file system errors

## API Endpoints

The server also provides REST API endpoints:
- `GET /api/surveys` - Get all surveys
- `GET /api/files` - Get all files
- `POST /api/surveys` - Create new survey
- `PUT /api/surveys/:id` - Update survey
- `DELETE /api/surveys/:id` - Delete survey

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Check server logs for backend errors
3. Ensure all dependencies are installed
4. Verify server is running and accessible

---

**Note**: This application now supports true multi-user real-time collaboration. Multiple users can work simultaneously and see changes instantly across all connected clients.

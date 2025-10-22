# Picklist Scanner User Guide

## Overview
The Picklist Scanner is a web application designed to help warehouse staff create picklists by scanning products into boxes. Each scanning session tracks the box number, box style, and all products scanned into that box.

## Getting Started

### Prerequisites
- A device with a web browser (desktop, tablet, or mobile)
- A barcode scanner connected to your device
- Internet connection (for product lookups)

### Accessing the Application
1. Open your web browser
2. Navigate to the application URL (typically `http://localhost:3000` for local development)
3. You'll see the "Picklist Scanner" homepage

## Using the Application

### Starting a New Scanning Session

1. When you first open the app or have no active sessions, you'll see the "Box Setup Form"
2. Enter the following information:
   - **Box Number**: Enter a unique identifier for your box (required)
   - **Box Style**: Select from dropdown options:
     - Envelope
     - Small Box
     - Medium Box
     - Large Box
     - Flat Rate
     - Tube
3. Click the "Start Session" button
4. Your scanning session is now active and ready to receive scans

### Scanning Products

1. With an active session, you'll see:
   - Box number and style at the top of the screen
   - A barcode input field
   - A list of scanned products (if any)

2. To scan a product:
   - Focus on the barcode input field
   - Scan the product barcode using your barcode scanner
   - The app will automatically:
     - Look up the product in the database
     - Add it to your session
     - Display it in the product list

3. Product information displayed:
   - Product name
   - SKU (Stock Keeping Unit)
   - Barcode
   - Description (if available)
   - Price (if available)
   - Quantity (number of times scanned)
   - First and last scan timestamps

### Multiple Scans of the Same Product
- If you scan the same product barcode multiple times, the app will:
  - Increment the quantity counter for that product
  - Update the "last scanned" timestamp
  - Keep all scans under a single product entry

### Error Messages
You may see error messages for:
- **Invalid barcode format**: The scanned barcode doesn't meet validation requirements
- **Product not found**: The barcode is valid but not in the database
- **No active session**: You tried to scan without starting a session first
- **Lookup failures**: Network or server issues prevented product lookup

To dismiss an error, click the "×" button on the error message.

### Managing Multiple Sessions

#### Viewing Sessions
- At the top of the page, you'll see a "Session Manager" section
- This displays all your current sessions (active, paused, and completed)
- Each session shows:
  - Box number
  - Box style
  - Number of products scanned
  - Session status (Active, Paused, or Completed)

#### Switching Between Sessions
1. Click on any session in the Session Manager
2. That session becomes active
3. You can now scan products into the newly active session

#### Creating Additional Sessions
1. Click the "Create New Session" button (or "+" button)
2. Fill out the box setup form
3. The new session becomes active

#### Deleting Sessions
1. Find the session you want to delete in the Session Manager
2. Click the delete button (typically a trash icon or "Delete" button)
3. Confirm deletion if prompted
4. The session and all its data are permanently removed

### Completing a Session

1. When you're done scanning products into a box:
2. Click the "Complete Session" button
3. The session status changes to "Completed"
4. The session remains available for viewing and downloading

### Downloading the Picklist

1. Once you have scanned products in your session:
2. Locate the "Download Picklist" section
3. Click the download button
4. A text file will be downloaded containing:
   - Box number and style
   - Complete list of all products with quantities
   - Product details (barcode, SKU, name, description)
   - Session information

### Data Persistence
- All sessions are automatically saved to your browser's local storage
- Sessions persist even if you close the browser or refresh the page
- When you return to the app, all your previous sessions are restored
- Data is stored locally on your device only

## Tips and Best Practices

1. **Complete sessions promptly**: Mark sessions as complete after downloading to keep your workspace organized
2. **Verify scans**: Check the product list after each scan to ensure correct product was added
3. **Use unique box numbers**: Helps identify and track specific boxes in your warehouse
4. **Clear old sessions**: Delete completed sessions you no longer need to reduce clutter
5. **Barcode scanner settings**: Ensure your barcode scanner is configured to send an "Enter" key after each scan for automatic submission

## Troubleshooting

### Barcode Won't Scan
- Ensure the barcode scanner is properly connected
- Check that the input field is focused (click on it if needed)
- Verify the barcode is not damaged or obscured
- Try manual entry of the barcode

### Product Lookup Fails
- Check your internet connection
- Verify the product exists in the database
- Wait a moment and try scanning again
- Contact your system administrator if issue persists

### Sessions Not Saving
- Check that your browser allows local storage
- Ensure you're not in private/incognito browsing mode
- Try refreshing the page to see if data persists
- Clear browser cache if experiencing persistent issues

### Page Not Loading
- Refresh your browser
- Clear browser cache
- Check that the development server is running
- Verify the correct URL

## Technical Notes

### Browser Compatibility
- Works best in modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript to be enabled
- Uses browser local storage (must be enabled)

### Data Format
- Barcodes are validated and sanitized before lookup
- Sessions are identified by unique UUID identifiers
- All timestamps are stored in local timezone

### Limitations
- Data is stored locally only (not synced across devices)
- Database lookup requires internet connection
- Browser storage limits apply (typically 5-10MB)

## Support
For technical issues or questions about the application, contact your system administrator or IT support team.

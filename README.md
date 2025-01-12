# Minerva Forum Timezone Converter

A Chrome extension that automatically converts class times on [forum.minerva.edu](https://forum.minerva.edu) to your preferred timezone.

![alt text](demo.gif)

## Features

- Converts class times between major Minerva hubs:
  - San Francisco (SF)
  - Buenos Aires (BA)
  - Seoul
  - Taipei
  - Hyderabad
  - Berlin
  - Tokyo
- Automatically detects your local timezone
- Dark theme UI that matches Minerva's forum design
- Remembers your timezone preference
- Shows original time on hover

## Installation

### Step-by-step Instructions for beginners

1. Getting the files:
   - Click the green "Code" button above
   - Select "Download ZIP"
   - Find the downloaded ZIP file in your Downloads folder
   - Right-click the ZIP file and select "Extract All" (Windows) or double-click (Mac)
   - Choose where to extract the files (remember this location!)

2. Opening Chrome Extensions page:
   - Open Google Chrome browser
   - Type `chrome://extensions` in the address bar
   - Press Enter

3. Enabling Developer Mode:
   - Look for the "Developer mode" toggle in the top right corner
   - Click to turn it ON (the toggle should slide to the right)
   - You should see new buttons appear at the top: "Load unpacked", "Pack extension", etc.

4. Loading the extension:
   - Click the "Load unpacked" button
   - Navigate to the folder where you extracted the files
   - Select the main folder (it should contain manifest.json)
   - Click "Select Folder" (Windows) or "Open" (Mac)

5. Verifying installation:
   - You should see "Timezone Converter" appear in your extensions list
   - A new extension icon should appear in your Chrome toolbar
   - If you don't see the icon, click the puzzle piece icon to find it

6. Testing the extension:
   - Go to forum.minerva.edu and log in
   - Look for the timezone selector below the "Courses" section
   - Try selecting different timezones to see the times update

If something goes wrong:

- Make sure all files are properly extracted
- Check that Developer mode is turned ON
- Try clicking the refresh icon on the extension card
- Make sure you're using Google Chrome (not Firefox or Safari)

## Usage

1. Visit [forum.minerva.edu](https://forum.minerva.edu)
2. Look for the timezone selector below the "Courses" section
3. Choose your preferred timezone
4. All course times will automatically update to your selected timezone
5. Hover over times to see the original timezone information

## Development

The extension uses:

- Moment.js for timezone calculations
- Chrome Storage API for saving preferences
- MutationObserver for handling Minerva's dynamic content

### Project Structure

```
25SF-MNRV_Forum-TimeZoneConverter/
├── manifest.json          # Extension configuration
├── popup/
│   ├── popup.html         # Timezone selector popup UI
│   └── popup.js           # Popup interaction logic
├── content/
│   ├── content.js         # Main timezone conversion logic
│   └── lib/
│       ├── moment.js      # Time handling library
│       └── moment-timezone-with-data.js  # Timezone data
└── background/
    └── background.js      # Background service worker
```

### Supported URL Patterns

- `*://forum.minerva.edu/*`

### Features in Detail

1. **Automatic Local Time Detection**
   - Detects your system timezone on first use
   - Marks your local timezone with "(Local Time)" in the dropdown

2. **Time Conversion**
   - Converts all course times instantly
   - Preserves course codes and instructor names
   - Shows abbreviated city names (SF, BA) for cleaner display

3. **UI Integration**
   - Matches Minerva's dark theme (#343434)
   - Uses system font stack for consistency
   - Responsive dropdown with custom styling

4. **Hover Information**
   - Original time and timezone
   - Converted time and timezone
   - Full timezone path for verification

### Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

### License

MIT License

### Contact

For issues or suggestions, please open an issue in the repository.

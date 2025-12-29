# Transcribe Images Extension

A Chrome extension that captures screenshots with area selection and transcribes text using Google's Gemini AI. Download transcriptions in multiple formats with preserved formatting.

## Features

- 📸 **Area Selection Screenshot** - Click and drag to select specific regions
- 🖼️ **Image Thumbnails** - Preview all captured screenshots before transcription
- 🔄 **Multiple Screenshots** - Capture and queue multiple images
- 📥 **Download/Copy Screenshots** - Download all images as ZIP or copy to clipboard for use in other tools/LLMs
- ✨ **AI Transcription** - Uses Gemini 1.5 Flash for accurate OCR with formatting preservation
- 📝 **Rich Text Output** - Preserves bold, italics, bullet points, tables, and colors
- 📋 **One-Click Copy** - Copy formatted text directly to clipboard (paste into Word, Google Docs, etc.)
- 💾 **Multiple Download Formats** - Save as Word (.docx), HTML, PDF, or plain text
- ⚙️ **Customizable** - Set default titles and auto-clear options

## Installation

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key (you'll enter this in extension settings)

### Step 2: Load Extension in Chrome

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `transcribe-images-extension` folder
6. The extension should now appear in your extensions list

### Step 3: Configure Extension

1. Click the extension icon in Chrome toolbar
2. Click "⚙️ Settings" at the bottom
3. Enter your **Gemini API Key**
4. (Optional) Set a default document title
5. Click "Save Settings"

## Usage

### Basic Workflow

1. **Capture Screenshots**
   - Click the extension icon
   - Click "📸 Capture Screenshot"
   - Click and drag on the page to select an area
   - Repeat for multiple screenshots (thumbnails will appear)
   - Each screenshot is numbered and can be removed individually

2. **Export Screenshots (Optional)**
   - **Download All**: Downloads all screenshots as a ZIP file (or individual PNGs if just one)
   - **Copy Images**: Copies images to clipboard (first image if multiple) or as HTML for pasting into documents
   - Great for sharing screenshots or using them in other LLMs/tools!

3. **Transcribe**
   - After capturing all needed screenshots
   - Click "✨ Transcribe with Gemini"
   - Wait for AI processing (usually a few seconds)
   - The transcribed text appears in a formatted preview box

4. **Copy or Download Transcription**
   - **Copy**: Click "📋 Copy" to copy formatted text to clipboard
     - Paste directly into Word, Google Docs, Notion, etc. with formatting preserved!
   - **Download**: Choose format (Word, HTML, PDF, or text) and click "💾 Download"

### Download Formats

| Format | Best For | Formatting |
|--------|----------|-----------|
| **Word (.docx)** | Editing in Microsoft Word or Google Docs | Full formatting preserved |
| **HTML (.html)** | Web viewing or importing to other tools | Full formatting preserved |
| **PDF (.pdf)** | Sharing, printing, or archiving | Full formatting, non-editable |
| **Text (.txt)** | Simple text editors, code, or scripts | No formatting (plain text) |

### Tips

- **Multiple Screenshots**: The extension preserves the exact order you capture images
- **Remove Screenshots**: Click the "×" next to any screenshot thumbnail to remove it
- **Download Screenshots**: Use "Download All" to get a ZIP of all screenshots (great for backup or sharing)
- **Copy Images**: Use "Copy Images" to copy to clipboard - paste into other LLMs like ChatGPT, Claude, or documents
- **Clear All**: Use "Clear All" to start over
- **Edit Transcription**: The output box is editable - click to make changes before copying/downloading
- **Auto-Clear**: Enable in settings to automatically clear images after downloading

## Rich Text Support

The extension preserves formatting from your screenshots:

- **Bold and Italic text**
- Bullet points and numbered lists
- Tables with borders
- Text colors
- Horizontal lines/dividers
- Paragraph structure

## Privacy & Data

- Screenshots are stored locally in Chrome until transcribed
- Images are sent to Google's Gemini API for transcription
- No data is stored on external servers
- You can clear all data anytime via the "Reset to Defaults" button in settings

## API Costs

- **Gemini API**: Free tier includes generous limits
  - Check [Google AI pricing](https://ai.google.dev/pricing) for current rates
  - Typical usage: Free tier is sufficient for most users

## Troubleshooting

### "Please set Gemini API key in settings"
- Go to Settings and enter your Gemini API key
- Make sure you copied the entire key from Google AI Studio

### Screenshot capture not working
- Make sure you have permission to access the current tab
- Some browser pages (like `chrome://`) cannot be captured
- Try refreshing the page and trying again

### Transcription errors
- Ensure images contain clear, readable text
- Very large images may take longer to process
- Check your Gemini API quota hasn't been exceeded

### Copy/paste formatting not working
- Try using the download options instead
- HTML and Word formats preserve all formatting

### Download fails
- Check your browser's download settings
- Ensure pop-ups are allowed for the extension
- Try a different format (HTML is most reliable)

## Updating the Extension

Since this is loaded as an unpacked extension:

1. Pull latest changes from GitHub: `git pull origin main`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Your extension is now updated!

## GitHub Repository Updates

When changes are pushed to GitHub:
- Users must manually pull updates (`git pull`)
- Then reload the extension in Chrome

**Note**: This extension is distributed via GitHub, not the Chrome Web Store. Updates are manual, but you have full control over the code.

## Version

Current version: 1.2.0

## Changelog

### v1.2.0
- 📥 Added "Download All" button to export screenshots as ZIP file
- 📋 Added "Copy Images" button to copy screenshots to clipboard
- 🔄 Screenshots can now be exported for use in other tools/LLMs

### v1.1.0
- ✨ Added rich text formatting support (bold, italics, lists, tables, colors)
- 📋 Added one-click copy with formatting preservation
- 💾 Added multiple download formats (Word, HTML, PDF, Text)
- 🖼️ Improved image thumbnail display
- 🗑️ Removed Google Drive integration (simpler setup)
- 📖 Added link to setup guide from extension popup

### v1.0.0
- Initial release with basic screenshot and transcription features

## License

This extension is provided as-is for personal use.

## Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/dusevitch/transcribe-images-extension/issues)
- Check the README for troubleshooting tips
- Review your API keys and settings configuration

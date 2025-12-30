# Transcribe Screenshot Extension

A Chrome extension that captures screenshots with area selection and transcribes text using Google's Gemini AI. Download transcriptions in multiple formats with preserved formatting.

## Features

- 📸 **Area Selection Screenshot** - Click and drag to select specific regions
- 🖼️ **Image Thumbnails** - Preview all captured screenshots before transcription
- 🔄 **Multiple Screenshots** - Capture and queue multiple images
- ⋮⋮ **Drag-and-Drop Reordering** - Reorder screenshots by dragging them to change transcription order
- 🖼️ **Image-Only Mode** - Mark screenshots to include as images without transcribing them
- 📥 **Download/Copy Screenshots** - Download all images as ZIP or copy to clipboard for use in other tools/LLMs
  - 💾 **Individual Download** - Download any single screenshot with one click
  - 📋 **Individual Copy** - Copy any single screenshot with one click
  - 📋 **Copy All** - Copy all screenshots at once to paste into Google Docs/Word
- ✨ **AI Transcription** - Uses Gemini 2.5 Flash for accurate OCR with formatting preservation
- ⚙️ **Customizable Prompts** - Edit the AI prompt before transcription for custom output formats
- 📝 **Rich Text Output** - Preserves bold, italics, bullet points, tables, and colors
- 📋 **One-Click Copy** - Copy formatted text directly to clipboard (paste into Word, Google Docs, etc.)
- 💾 **Multiple Download Formats** - Save as Word (.docx), HTML, PDF, or plain text
  - 📄 **True DOCX Format** - Proper Office Open XML format with perfect table rendering
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
5. Select the `transcribe-screenshot-extension` folder
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
   - **Download Individual Image**: Click the 💾 icon next to any screenshot to download just that one
   - **Copy Individual Image**: Click the 📋 icon next to any screenshot to copy just that one
   - **Download All**: Downloads all screenshots as a ZIP file (or individual PNGs if just one)
   - **Copy All Images**: Copies all images to clipboard as HTML - paste into Google Docs/Word to get all images at once!
   - Great for sharing screenshots or using them in other LLMs/tools!

3. **Transcribe**
   - After capturing all needed screenshots
   - (Optional) Click "▼ Customize Prompt" to edit the AI prompt for custom output
     - Edit the prompt to change output format (e.g., "Just extract bullet points" or "Translate to Spanish")
     - Click "Save as Default" to save your custom prompt for future use
     - Click "Reset to Default" to restore the original prompt
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
| **Word (.docx)** | Editing in Microsoft Word or Google Docs | ✅ Full formatting with perfect table structure |
| **HTML (.html)** | Web viewing or importing to other tools | ✅ Full formatting preserved |
| **PDF (.pdf)** | Sharing, printing, or archiving | ✅ Full formatting, non-editable |
| **Text (.txt)** | Simple text editors, code, or scripts | ❌ No formatting (plain text) |

### Tips

- **Drag to Reorder**: Click and drag screenshots by the ⋮⋮ handle to reorder them - transcription follows the new order
- **Image-Only Mode**: Check the 🖼️ checkbox next to a screenshot to include it without transcribing (useful for diagrams, charts, or images you want in the document but don't need text extracted from)
- **Multiple Screenshots**: The extension preserves the exact order you capture images
- **Individual Download**: Click the 💾 icon next to any screenshot to download just that image with timestamp
- **Individual Copy**: Click the 📋 icon next to any screenshot to copy just that image
- **Copy All at Once**: Use "Copy Images" button to copy all screenshots as HTML - paste into Google Docs/Word and all images appear together!
- **Remove Screenshots**: Click the "×" next to any screenshot thumbnail to remove it
- **Download All**: Use "Download All" to get a ZIP of all screenshots (great for backup or sharing)
- **Custom Prompts**: Modify the AI prompt for different outputs:
  - "Extract only the main points as bullet points"
  - "Translate the text to [language]"
  - "Summarize this content"
  - "Format as a table" or "Convert to JSON"
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

**For full details, see our [Privacy Policy](PRIVACY.md)**

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

Current version: 1.5.0

## Changelog

### v1.5.0
- ⋮⋮ **Drag-and-Drop Reordering** - Reorder screenshots by dragging them to change transcription order
- 🖼️ **Image-Only Mode** - Mark screenshots to include as images without transcribing them (checkbox next to each screenshot)
- ✨ **Smart Transcription** - Only transcribes unmarked images, skipping those marked as image-only

### v1.4.0
- 📄 **Upgraded to True DOCX Format** - Replaced RTF with proper Office Open XML format for perfect table rendering
- 💾 **Individual Download Buttons** - Click 💾 icon next to any screenshot to download just that image with timestamp
- 📋 **Individual Copy Buttons** - Click 📋 icon next to any screenshot to copy just that image
- 📋 **Copy All Images** - Copy all screenshots at once as HTML to paste into Google Docs/Word
- 🔄 **Updated to Gemini 2.5 Flash** - Using the latest AI model for better transcription
- ✨ **Better Table Support** - Tables now render perfectly in Word with proper structure, borders, and formatting

### v1.3.0
- ⚙️ Added customizable prompt editor - modify AI instructions before transcription
- 💾 Save custom prompts as defaults for repeated use
- 🔄 Easily switch between custom and default prompts
- 🎯 Enable use cases: translation, summarization, custom formatting, etc.

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
- Open an issue on [GitHub](https://github.com/dusevitch/transcribe-screenshot-extension/issues)
- Check the README for troubleshooting tips
- Review your API keys and settings configuration

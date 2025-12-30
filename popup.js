let capturedImages = [];
let transcribedHTML = '';
let draggedIndex = null;

const DEFAULT_PROMPT = `Transcribe all text from these images in the exact order they appear. Your output should be formatted in HTML with proper semantic tags. Use the following guidelines:

1. Use <strong> for bold text, <em> for italics
2. Use <ul> and <li> for bullet points, <ol> and <li> for numbered lists
3. Use <table>, <tr>, <th>, and <td> for tables with proper borders
4. Use <hr> for horizontal lines/dividers
5. Use <p> tags to separate paragraphs
6. Preserve colors using inline styles like <span style="color: #FF0000">text</span> when visible
7. Maintain the original formatting, structure, and hierarchy
8. If there are multiple images, transcribe them in sequence

Provide ONLY the HTML content without wrapping it in <html>, <body>, or \`\`\`html tags. Start directly with the content.`;

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved images from storage
  await loadImagesFromStorage();

  // Listen for storage changes (when background script adds new images)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.images) {
      capturedImages = changes.images.newValue || [];
      updateImagesList();
      showStatus('Screenshot captured!', 'success');
    }
  });

  // Event listeners
  document.getElementById('captureBtn').addEventListener('click', captureScreenshot);
  document.getElementById('clearImages').addEventListener('click', clearImages);
  document.getElementById('downloadImages').addEventListener('click', downloadAllImages);
  document.getElementById('copyImages').addEventListener('click', copyAllImages);
  document.getElementById('transcribeBtn').addEventListener('click', transcribeImages);
  document.getElementById('togglePrompt').addEventListener('click', togglePromptEditor);
  document.getElementById('savePrompt').addEventListener('click', saveCustomPrompt);
  document.getElementById('resetPrompt').addEventListener('click', resetPromptToDefault);
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('downloadBtn').addEventListener('click', downloadDocument);
  document.getElementById('settingsLink').addEventListener('click', openSettings);

  // Load default title from settings and always append timestamp
  const { defaultTitle, customPrompt } = await chrome.storage.sync.get(['defaultTitle', 'customPrompt']);
  const baseTitle = defaultTitle || 'Transcription';
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', '-').replace(/:/g, '');
  document.getElementById('fileTitle').value = `${baseTitle}-${timestamp}`;

  // Load custom prompt or use default
  const promptText = customPrompt || DEFAULT_PROMPT;
  document.getElementById('customPrompt').value = promptText;
});

async function loadImagesFromStorage() {
  const { images, lastTranscription, lastTranscriptionTitle } = await chrome.storage.local.get(['images', 'lastTranscription', 'lastTranscriptionTitle']);

  if (images && images.length > 0) {
    capturedImages = images;
    updateImagesList();
  }

  // Restore last transcription if it exists
  if (lastTranscription) {
    transcribedHTML = lastTranscription;
    document.getElementById('transcriptionOutput').innerHTML = lastTranscription;
    document.getElementById('resultSection').classList.remove('hidden');

    // Restore the title if it was saved
    if (lastTranscriptionTitle) {
      document.getElementById('fileTitle').value = lastTranscriptionTitle;
    }
  }
}

async function captureScreenshot() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject content script and start selection
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: startSelection
    });

    showStatus('Select area to capture...', 'info');

    // The background script will handle capturing and storing the image
    // The storage listener will update the UI when the image is added

  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
}

function updateImagesList() {
  const imagesList = document.getElementById('imagesList');
  const imageCount = document.getElementById('imageCount');
  const imagesSection = document.getElementById('imagesSection');
  const transcribeSection = document.getElementById('transcribeSection');

  imagesList.innerHTML = '';
  imageCount.textContent = capturedImages.length;

  if (capturedImages.length > 0) {
    imagesSection.classList.remove('hidden');
    transcribeSection.classList.remove('hidden');

    capturedImages.forEach((img, index) => {
      const item = document.createElement('div');
      item.className = 'image-item';
      item.setAttribute('draggable', 'true');
      item.setAttribute('data-index', index);

      const isImageOnly = img.imageOnly || false;

      item.innerHTML = `
        <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
        <img src="${img.data}" alt="Screenshot ${index + 1}">
        <span>Screenshot ${index + 1}</span>
        <input type="checkbox" class="image-only-check" data-index="${index}" title="Include as image only (don't transcribe)" ${isImageOnly ? 'checked' : ''}>
        <label class="image-only-label" title="Include as image only (don't transcribe)">🖼️</label>
        <span class="download-single" data-index="${index}" title="Download this image">💾</span>
        <span class="copy-single" data-index="${index}" title="Copy this image">📋</span>
        <span class="remove" data-index="${index}" title="Remove this image">×</span>
      `;

      // Add event listeners
      item.querySelector('.remove').addEventListener('click', (e) => {
        removeImage(parseInt(e.target.dataset.index));
      });

      item.querySelector('.copy-single').addEventListener('click', (e) => {
        copySingleImage(parseInt(e.target.dataset.index));
      });

      item.querySelector('.download-single').addEventListener('click', (e) => {
        downloadSingleImage(parseInt(e.target.dataset.index));
      });

      item.querySelector('.image-only-check').addEventListener('change', (e) => {
        toggleImageOnly(parseInt(e.target.dataset.index));
      });

      // Drag and drop event listeners
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);
      item.addEventListener('dragend', handleDragEnd);

      imagesList.appendChild(item);
    });
  } else {
    imagesSection.classList.add('hidden');
    transcribeSection.classList.add('hidden');
  }
}

function toggleImageOnly(index) {
  if (index >= 0 && index < capturedImages.length) {
    capturedImages[index].imageOnly = !capturedImages[index].imageOnly;
    saveImagesToStorage();
    showStatus(
      capturedImages[index].imageOnly
        ? `Screenshot ${index + 1} marked as image-only`
        : `Screenshot ${index + 1} will be transcribed`,
      'info'
    );
  }
}

function handleDragStart(e) {
  draggedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
  e.currentTarget.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  const dropIndex = parseInt(e.currentTarget.getAttribute('data-index'));

  if (draggedIndex !== null && draggedIndex !== dropIndex) {
    // Reorder the array
    const draggedItem = capturedImages[draggedIndex];
    capturedImages.splice(draggedIndex, 1);
    capturedImages.splice(dropIndex, 0, draggedItem);

    saveImagesToStorage();
    updateImagesList();
    showStatus('Screenshots reordered', 'success');
  }

  return false;
}

function handleDragEnd(e) {
  e.currentTarget.style.opacity = '1';
  draggedIndex = null;
}

function removeImage(index) {
  capturedImages.splice(index, 1);
  saveImagesToStorage();
  updateImagesList();
}

async function clearImages() {
  capturedImages = [];
  transcribedHTML = '';

  // Clear from storage
  await chrome.storage.local.set({
    images: [],
    lastTranscription: null,
    lastTranscriptionTitle: null
  });

  updateImagesList();
  document.getElementById('resultSection').classList.add('hidden');
  document.getElementById('transcriptionOutput').innerHTML = '';

  showStatus('All images and transcription cleared', 'info');
}

async function downloadAllImages() {
  if (capturedImages.length === 0) {
    showStatus('No images to download', 'error');
    return;
  }

  showStatus('Preparing images for download...', 'info');

  try {
    if (capturedImages.length === 1) {
      // Single image - download directly
      downloadSingleImage(capturedImages[0].data, 'screenshot-1.png');
      showStatus('Image downloaded!', 'success');
    } else {
      // Multiple images - create a ZIP file
      await downloadImagesAsZip();
      showStatus(`Downloaded ${capturedImages.length} images as ZIP!`, 'success');
    }
  } catch (error) {
    showStatus('Download failed: ' + error.message, 'error');
  }
}

function downloadSingleImage(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function downloadImagesAsZip() {
  // Use JSZip library (we'll add it to the HTML)
  if (typeof JSZip === 'undefined') {
    // Fallback: download images individually
    capturedImages.forEach((img, index) => {
      setTimeout(() => {
        downloadSingleImage(img.data, `screenshot-${index + 1}.png`);
      }, index * 200); // Stagger downloads
    });
    return;
  }

  const zip = new JSZip();
  const imgFolder = zip.folder('screenshots');

  // Add each image to the ZIP
  capturedImages.forEach((img, index) => {
    const base64Data = img.data.split(',')[1];
    imgFolder.file(`screenshot-${index + 1}.png`, base64Data, { base64: true });
  });

  // Generate and download the ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `screenshots-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadSingleImage(index) {
  if (index < 0 || index >= capturedImages.length) {
    showStatus('Invalid image index', 'error');
    return;
  }

  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', '-').replace(/:/g, '');
  const filename = `screenshot-${index + 1}-${timestamp}.png`;

  const a = document.createElement('a');
  a.href = capturedImages[index].data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showStatus(`Screenshot ${index + 1} downloaded!`, 'success');
}

async function copySingleImage(index) {
  if (index < 0 || index >= capturedImages.length) {
    showStatus('Invalid image index', 'error');
    return;
  }

  showStatus('Copying image...', 'info');

  try {
    const response = await fetch(capturedImages[index].data);
    const blob = await response.blob();

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);

    showStatus(`Screenshot ${index + 1} copied to clipboard!`, 'success');
  } catch (error) {
    showStatus('Copy failed: ' + error.message, 'error');
  }
}

async function copyAllImages() {
  if (capturedImages.length === 0) {
    showStatus('No images to copy', 'error');
    return;
  }

  showStatus('Copying images to clipboard...', 'info');

  try {
    // For multiple images, copy as HTML with embedded base64 images
    // This works well in Google Docs, Word, and other rich text editors
    const htmlContent = capturedImages.map((img, index) =>
      `<img src="${img.data}" alt="Screenshot ${index + 1}" style="max-width: 100%; margin: 10px 0;" />`
    ).join('<br/>');

    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    const textBlob = new Blob([`${capturedImages.length} screenshot(s)`], { type: 'text/plain' });

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })
    ]);

    if (capturedImages.length === 1) {
      showStatus('Image copied to clipboard!', 'success');
    } else {
      showStatus(`${capturedImages.length} images copied! Paste into Google Docs/Word.`, 'success');
    }
  } catch (error) {
    // Fallback: Try copying just the first image as PNG
    try {
      const response = await fetch(capturedImages[0].data);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      if (capturedImages.length === 1) {
        showStatus('Image copied to clipboard!', 'success');
      } else {
        showStatus(`First image copied! (${capturedImages.length} total. Use Download All for all images)`, 'info');
      }
    } catch (err) {
      showStatus('Copy failed. Try Download All instead.', 'error');
    }
  }
}

async function saveImagesToStorage() {
  await chrome.storage.local.set({ images: capturedImages });
}

function togglePromptEditor() {
  const promptEditor = document.getElementById('promptEditor');
  const toggleBtn = document.getElementById('togglePrompt');

  if (promptEditor.classList.contains('hidden')) {
    promptEditor.classList.remove('hidden');
    toggleBtn.textContent = '▲ Hide Prompt';
  } else {
    promptEditor.classList.add('hidden');
    toggleBtn.textContent = '▼ Customize Prompt (Optional)';
  }
}

async function saveCustomPrompt() {
  const promptText = document.getElementById('customPrompt').value.trim();

  if (!promptText) {
    showStatus('Prompt cannot be empty', 'error');
    return;
  }

  await chrome.storage.sync.set({ customPrompt: promptText });
  showStatus('Custom prompt saved as default!', 'success');
}

async function resetPromptToDefault() {
  document.getElementById('customPrompt').value = DEFAULT_PROMPT;
  await chrome.storage.sync.remove('customPrompt');
  showStatus('Prompt reset to default', 'success');
}

async function transcribeImages() {
  if (capturedImages.length === 0) {
    showStatus('No images to transcribe', 'error');
    return;
  }

  const { geminiApiKey } = await chrome.storage.sync.get(['geminiApiKey']);

  if (!geminiApiKey) {
    showStatus('Please set Gemini API key in settings', 'error');
    return;
  }

  showStatus('Transcribing images...', 'info');
  document.getElementById('transcribeBtn').disabled = true;

  try {
    // Get the current prompt (custom or default)
    const promptText = document.getElementById('customPrompt').value.trim() || DEFAULT_PROMPT;

    // Filter out images marked as "image-only" (only transcribe unmarked images)
    const imagesToTranscribe = capturedImages.filter(img => !img.imageOnly);

    if (imagesToTranscribe.length === 0) {
      showStatus('All images are marked as image-only. Nothing to transcribe.', 'error');
      document.getElementById('transcribeBtn').disabled = false;
      return;
    }

    // Prepare images for Gemini (only the ones not marked as image-only)
    const imageParts = imagesToTranscribe.map(img => ({
      inlineData: {
        mimeType: 'image/png',
        data: img.data.split(',')[1] // Remove data:image/png;base64, prefix
      }
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: promptText
              },
              ...imageParts
            ]
          }]
        })
      }
    );

    const data = await response.json();

    // Log full response for debugging
    console.log('Gemini API Response:', data);

    // Check for API errors
    if (data.error) {
      throw new Error(`API Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    // Check if response was blocked
    if (data.candidates && data.candidates[0]?.finishReason === 'SAFETY') {
      throw new Error('Content blocked by safety filters. Try different images.');
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      transcribedHTML = data.candidates[0].content.parts[0].text;

      // Clean up HTML if Gemini wrapped it in code blocks
      transcribedHTML = transcribedHTML.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

      // Display in the output div
      document.getElementById('transcriptionOutput').innerHTML = transcribedHTML;
      document.getElementById('resultSection').classList.remove('hidden');

      // Save transcription to storage for persistence
      const currentTitle = document.getElementById('fileTitle').value;
      await chrome.storage.local.set({
        lastTranscription: transcribedHTML,
        lastTranscriptionTitle: currentTitle
      });

      showStatus('Transcription complete!', 'success');
    } else {
      // More detailed error message
      console.error('Unexpected API response structure:', data);
      throw new Error(`No transcription returned. API response: ${JSON.stringify(data).substring(0, 200)}`);
    }

  } catch (error) {
    console.error('Transcription error:', error);
    showStatus('Transcription failed: ' + error.message, 'error');
  } finally {
    document.getElementById('transcribeBtn').disabled = false;
  }
}

async function copyToClipboard() {
  const outputDiv = document.getElementById('transcriptionOutput');

  try {
    // Create a temporary div to hold the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = outputDiv.innerHTML;
    document.body.appendChild(tempDiv);

    // Select the content
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // Use the Clipboard API with HTML support
    const htmlBlob = new Blob([outputDiv.innerHTML], { type: 'text/html' });
    const textBlob = new Blob([outputDiv.innerText], { type: 'text/plain' });

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })
    ]);

    // Clean up
    document.body.removeChild(tempDiv);
    selection.removeAllRanges();

    showStatus('Copied to clipboard with formatting!', 'success');
  } catch (error) {
    // Fallback to plain text copy
    try {
      await navigator.clipboard.writeText(outputDiv.innerText);
      showStatus('Copied as plain text', 'success');
    } catch (err) {
      showStatus('Copy failed: ' + err.message, 'error');
    }
  }
}

async function downloadDocument() {
  const title = document.getElementById('fileTitle').value || 'Untitled Transcription';
  const format = document.getElementById('fileFormat').value;
  const outputDiv = document.getElementById('transcriptionOutput');

  if (!transcribedHTML) {
    showStatus('No transcribed text to download', 'error');
    return;
  }

  showStatus(`Generating ${format.toUpperCase()} file...`, 'info');

  try {
    switch (format) {
      case 'html':
        downloadHTML(title, transcribedHTML);
        break;
      case 'txt':
        downloadPlainText(title, outputDiv.innerText);
        break;
      case 'docx':
        await downloadDOCX(title, outputDiv);
        break;
      case 'pdf':
        await downloadPDF(title, outputDiv);
        break;
    }
    showStatus('File downloaded!', 'success');
  } catch (error) {
    showStatus('Download failed: ' + error.message, 'error');
  }
}

function downloadHTML(title, content) {
  const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f8f9fa; font-weight: 600; }
    hr { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
  </style>
</head>
<body>
${content}
</body>
</html>`;

  downloadFile(title + '.html', fullHTML, 'text/html');
}

function downloadPlainText(title, content) {
  downloadFile(title + '.txt', content, 'text/plain');
}

async function downloadDOCX(title, outputDiv) {
  // Generate a proper .docx file using Office Open XML format
  const htmlContent = outputDiv.innerHTML;

  // Convert HTML to Word XML
  const wordXML = htmlToWordXML(htmlContent);

  // Create the DOCX file structure (DOCX is a ZIP file with XML files)
  await createDOCXFile(title, wordXML);
}

function htmlToWordXML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let xml = '';

  function escapeXML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function createTextRun(text, props = {}) {
    let propsXML = '';
    if (props.bold) propsXML += '<w:b/>';
    if (props.italic) propsXML += '<w:i/>';
    if (props.underline) propsXML += '<w:u w:val="single"/>';
    if (props.color) propsXML += `<w:color w:val="${props.color}"/>`;

    return `<w:r>${propsXML ? `<w:rPr>${propsXML}</w:rPr>` : ''}<w:t xml:space="preserve">${escapeXML(text)}</w:t></w:r>`;
  }

  function processNode(node, inheritedProps = {}) {
    let result = '';

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text.trim()) {
        result += createTextRun(text, inheritedProps);
      }
      return result;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const newProps = { ...inheritedProps };

      switch (tagName) {
        case 'p':
          result += '<w:p>';
          result += '<w:pPr></w:pPr>';
          result += processChildren(node, newProps);
          result += '</w:p>';
          break;

        case 'br':
          result += '<w:r><w:br/></w:r>';
          break;

        case 'strong':
        case 'b':
          newProps.bold = true;
          result += processChildren(node, newProps);
          break;

        case 'em':
        case 'i':
          newProps.italic = true;
          result += processChildren(node, newProps);
          break;

        case 'u':
          newProps.underline = true;
          result += processChildren(node, newProps);
          break;

        case 'h1':
        case 'h2':
        case 'h3':
          newProps.bold = true;
          result += '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>';
          result += processChildren(node, newProps);
          result += '</w:p>';
          break;

        case 'ul':
        case 'ol':
          result += processChildren(node, newProps);
          break;

        case 'li':
          result += '<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>';
          result += processChildren(node, newProps);
          result += '</w:p>';
          break;

        case 'table':
          result += convertTableToWordXML(node);
          break;

        case 'tr':
        case 'th':
        case 'td':
          // These are handled by convertTableToWordXML
          break;

        case 'hr':
          result += '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="auto"/></w:pBdr></w:pPr></w:p>';
          break;

        case 'span':
          // Check for color style
          const style = node.getAttribute('style');
          if (style && style.includes('color')) {
            const colorMatch = style.match(/color:\s*#([0-9a-fA-F]{6})/);
            if (colorMatch) {
              newProps.color = colorMatch[1];
            }
          }
          result += processChildren(node, newProps);
          break;

        default:
          result += processChildren(node, newProps);
      }
    }

    return result;
  }

  function processChildren(node, props = {}) {
    let result = '';
    for (let child of node.childNodes) {
      result += processNode(child, props);
    }
    return result;
  }

  function convertTableToWordXML(table) {
    let tableXML = '<w:tbl>';

    // Table properties
    tableXML += '<w:tblPr>';
    tableXML += '<w:tblStyle w:val="TableGrid"/>';
    tableXML += '<w:tblW w:w="5000" w:type="pct"/>';
    tableXML += '<w:tblBorders>';
    tableXML += '<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>';
    tableXML += '<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>';
    tableXML += '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>';
    tableXML += '<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>';
    tableXML += '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>';
    tableXML += '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>';
    tableXML += '</w:tblBorders>';
    tableXML += '</w:tblPr>';

    // Table grid (column definitions)
    const firstRow = table.querySelector('tr');
    if (firstRow) {
      const cellCount = firstRow.querySelectorAll('th, td').length;
      tableXML += '<w:tblGrid>';
      for (let i = 0; i < cellCount; i++) {
        tableXML += '<w:gridCol w:w="2000"/>';
      }
      tableXML += '</w:tblGrid>';
    }

    // Process rows
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      tableXML += '<w:tr>';

      const cells = row.querySelectorAll('th, td');
      const isHeader = row.querySelector('th') !== null;

      cells.forEach(cell => {
        tableXML += '<w:tc>';
        tableXML += '<w:tcPr>';
        tableXML += '<w:tcW w:w="2000" w:type="dxa"/>';
        if (isHeader) {
          tableXML += '<w:shd w:val="clear" w:color="auto" w:fill="F8F9FA"/>';
        }
        tableXML += '</w:tcPr>';

        // Cell content
        tableXML += '<w:p>';
        tableXML += '<w:pPr>';
        if (isHeader) {
          tableXML += '<w:jc w:val="center"/>';
        }
        tableXML += '</w:pPr>';

        const cellProps = isHeader ? { bold: true } : {};
        for (let child of cell.childNodes) {
          tableXML += processNode(child, cellProps);
        }

        tableXML += '</w:p>';
        tableXML += '</w:tc>';
      });

      tableXML += '</w:tr>';
    });

    tableXML += '</w:tbl>';
    return tableXML;
  }

  // Process the entire document body
  xml = processNode(doc.body);

  // If no paragraphs were created, wrap in a paragraph
  if (!xml.includes('<w:p>')) {
    xml = `<w:p><w:pPr></w:pPr>${xml}</w:p>`;
  }

  return xml;
}

async function createDOCXFile(title, bodyXML) {
  // Check if JSZip is available
  if (typeof JSZip === 'undefined') {
    throw new Error('JSZip library not loaded. Cannot create DOCX file.');
  }

  const zip = new JSZip();

  // [Content_Types].xml
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`;
  zip.file('[Content_Types].xml', contentTypes);

  // _rels/.rels
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  zip.folder('_rels').file('.rels', rels);

  // word/_rels/document.xml.rels
  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`;
  zip.folder('word').folder('_rels').file('document.xml.rels', docRels);

  // word/document.xml
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXML}
  </w:body>
</w:document>`;
  zip.folder('word').file('document.xml', document);

  // word/styles.xml
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:basedOn w:val="TableNormal"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      </w:tblBorders>
    </w:tblPr>
  </w:style>
</w:styles>`;
  zip.folder('word').file('styles.xml', styles);

  // word/numbering.xml (for bullet points)
  const numbering = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="720" w:hanging="360"/>
      </w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`;
  zip.folder('word').file('numbering.xml', numbering);

  // Generate the DOCX file
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(title + '.docx', blob);
}

async function downloadPDF(title, outputDiv) {
  // Create a printable HTML page
  const htmlContent = outputDiv.innerHTML;

  const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @media print {
      @page { margin: 2cm; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 12px 0;
    }
    p { margin: 8px 0; }
    ul, ol { margin: 8px 0; padding-left: 24px; }
  </style>
  <script>
    // Auto-trigger print dialog when page loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 100);
    };
  </script>
</head>
<body>
<h1>${title}</h1>
${htmlContent}
<p style="margin-top: 40px; font-size: 12px; color: #666;">To save as PDF: Use Ctrl+P (or Cmd+P on Mac), then select "Save as PDF" as the destination.</p>
</body>
</html>`;

  // Create blob and download as HTML file that can be opened and printed
  const blob = new Blob([fullHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Open in new tab without affecting the popup
  chrome.tabs.create({ url: url, active: false });

  showStatus('Print preview opened in new tab - use Ctrl+P to save as PDF', 'success');

  // Clean up the blob URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(filename, blob);
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function openSettings(e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.classList.remove('hidden');

  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      status.classList.add('hidden');
    }, 3000);
  }
}

// Content script function (injected into page)
function startSelection() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'screenshot-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    cursor: crosshair;
    z-index: 999999;
  `;

  const selectionBox = document.createElement('div');
  selectionBox.id = 'screenshot-selection';
  selectionBox.style.cssText = `
    position: fixed;
    border: 2px dashed #4285f4;
    background: rgba(66, 133, 244, 0.1);
    z-index: 1000000;
    display: none;
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(selectionBox);

  let startX, startY, isSelecting = false;

  // Function to clean up and remove elements
  const cleanup = () => {
    isSelecting = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown);
    if (overlay && overlay.parentNode) {
      overlay.remove();
    }
    if (selectionBox && selectionBox.parentNode) {
      selectionBox.remove();
    }
  };

  const handleMouseDown = (e) => {
    if (isSelecting) return; // Prevent multiple selections

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';

    // Add mouse event listeners to document for better tracking
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
  };

  const handleMouseUp = async (e) => {
    if (!isSelecting) return;

    const endX = e.clientX;
    const endY = e.clientY;

    const rect = {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    };

    // Clean up UI and event listeners FIRST
    cleanup();

    // Capture the selected area
    if (rect.width > 10 && rect.height > 10) {
      chrome.runtime.sendMessage({
        type: 'captureArea',
        rect: rect
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      cleanup();
    }
  };

  overlay.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleKeyDown);
}

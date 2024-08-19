/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// will eventually be for changing the window title dynamically based on the project name
const windowTitleStyle = document.getElementById('windowTitle').style;
windowTitleStyle.setProperty('--projectTitle', '"projetThese"');

const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,  // Adds line numbers to the editor
    mode: 'markdown',  // Set mode for syntax highlighting
    theme: 'dracula',  // Set theme
    gutter: '30px',  // Set width of gutter
});
/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// will eventually be for changing the window title dynamically based on the project name
const windowTitleStyle = document.getElementById('windowTitle').style;

// const signalerProbleme = document.getElementById('statusBarCenter');
// signalerProbleme.addEventListener('click', () => {
//     console.log('l\'utilisateur a signalé un problème');
// });
const statusBar = document.getElementById('statusBar');

const statusBarLeft = document.createElement('div');
statusBarLeft.id = 'statusBarLeft';

// const projectSpan = document.createElement('span');
// projectSpan.textContent = 'PROJECT NAME → OPEN FOLDER NAME';
// statusBarLeft.appendChild(projectSpan);

// const wordCountSpan = document.createElement('span');
// wordCountSpan.textContent = 'WORD COUNT ・ CHARACTER COUNT';
// statusBarLeft.appendChild(wordCountSpan);

const statusBarRight = document.createElement('div');
statusBarRight.id = 'statusBarRight';

const readySpan = document.createElement('span');
readySpan.textContent = 'Prêt';
statusBarRight.appendChild(readySpan);

statusBar.appendChild(statusBarLeft);
statusBar.appendChild(statusBarRight);
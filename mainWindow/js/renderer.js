// change the window title dynamically based on the project name
const windowTitleStyle = document.getElementById('windowTitle').style;

// change the color of the nav bar and window buttons when the window is unfocused
window.api.onWindowFocusChange((event, isFocused) => {
    const navBar = document.querySelector('nav');
    const closeButton = document.getElementById('close');
    const minimizeButton = document.getElementById('min');
    const maximizeButton = document.getElementById('max');
    if (isFocused) {
        navBar.classList.remove('unfocused');
        closeButton.classList.remove('unfocused');
        minimizeButton.classList.remove('unfocused');
        maximizeButton.classList.remove('unfocused');
    } else {
        navBar.classList.add('unfocused');
        closeButton.classList.add('unfocused');
        minimizeButton.classList.add('unfocused');
        maximizeButton.classList.add('unfocused');
    }
});

document.addEventListener('mousedown', (event) => {
    if (!codingBar.contains(event.target)) {
        hideCodingBar();
    }
    if (!formattingBar.contains(event.target)) {
        hideFormattingBar();
    }
    if (!contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});

// const signalerProbleme = document.getElementById('statusBarCenter');
// signalerProbleme.addEventListener('click', () => {
//     console.log('l\'utilisateur a signalé un problème');
// });
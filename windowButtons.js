// event listeners for clicks on the window buttons
document.getElementById('min').addEventListener('click', () => {
    api.send('app/minimize')
});

document.getElementById('close').addEventListener('click', () => {
    api.send('app/close');
});
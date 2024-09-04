document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        boldSelection();
    }
    if (event.ctrlKey && event.key === 'i') {
        event.preventDefault();
        italicSeletion();
    }
});
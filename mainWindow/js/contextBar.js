const formattingBar = document.getElementById('formattingBar');
const codeButton = document.getElementById('codeTextButton');

editorContainer.addEventListener('mouseup', function (event) {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        formattingBar.style.display = 'block';
        formattingBar.style.left = `${mouseX + scrollX - (formattingBar.offsetWidth / 2)}px`;
        formattingBar.style.top = `${mouseY + scrollY - formattingBar.offsetHeight - 10}px`;
    } else {
        hideFormattingBar();
    }
});

document.addEventListener('mousedown', function (event) {
    if (!formattingBar.contains(event.target)) {
        hideFormattingBar();
    }
});

codeButton.addEventListener('click', codeText);

function hideFormattingBar() {
    formattingBar.style.display = 'none';
}

function codeText() {
    hideFormattingBar();
}
function codeText(barLeft, barTop) {
    const codingBar = document.getElementById('codingBar');
    const codingBarInput = document.getElementById('codeInput');
    const codingBarNewParentButton = document.getElementById('addCodeButton');
    const codingBarNewSubcodeButton = document.getElementById('addSubCodeButton');
    const editor = document.querySelector('.CodeMirror').CodeMirror;
    const doc = editor.getDoc();
    const selection = doc.getSelection();

    if (selection) {
        const category = 'test category';

        if (category) {
            const markedText = doc.markText(doc.getCursor('start'), doc.getCursor('end'), {
                className: 'category-highlight'
            });
        }
    }

    codingBar.style.left = `${barLeft}px`;
    codingBar.style.top = `${barTop + 60}px`;
    codingBar.style.display = 'flex';
    hideFormattingBar();
}

document.addEventListener('mousedown', function (event) {
    if (!codingBar.contains(event.target)) {
        hideCodingBar();
    }
});

function hideCodingBar() {
    const codingBar = document.getElementById('codingBar');
    codingBar.style.display = 'none';
}
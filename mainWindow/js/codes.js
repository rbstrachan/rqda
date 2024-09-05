const codingBar = document.getElementById('codingBar');
const codingBarInput = document.getElementById('codeInput');
let codingBarInputValue;
const codingBarNewParentButton = document.getElementById('addCodeButton');
const codingBarNewSubcodeButton = document.getElementById('addSubCodeButton');
let codes = [];

function showCodeBar(barLeft, barTop) {
    codingBar.style.left = `${barLeft}px`;
    codingBar.style.top = `${barTop + 60}px`;
    codingBar.style.display = 'flex';
    codingBarInput.focus();
    hideFormattingBar();
}

function highlightSelection(codeName) {
    const editor = document.querySelector('.CodeMirror').CodeMirror;
    const doc = editor.getDoc();
    const selection = doc.getSelection();

    const code = codeName;
    if (code) {
        const markedText = doc.markText(doc.getCursor('start'), doc.getCursor('end'), {
            className: 'code-highlight',
            attributes: {
                'code': code
            }
        });
        codes.push({ code, content: selection })
        updateCodesList();
        codingBarInput.value = '';
    }
}

function updateCodesList() {
    const codesList = document.getElementById('codesList');
    codesList.innerHTML = '';
    codes.forEach((code, index) => {
        const codeElement = document.createElement('div');
        codeElement.classList.add('code');
        codeElement.innerHTML = `
            <span class="code-name">${code.code}</span>
            <span class="code-content">${code.content}</span>
        `;
        codesList.appendChild(codeElement);
    });
}

codingBarNewParentButton.addEventListener('click', function () {
    highlightSelection(codingBarInputValue);
});

document.addEventListener('mousedown', function (event) {
    if (!codingBar.contains(event.target)) {
        hideCodingBar();
    }
});

codingBarInput.addEventListener('keyup', function (event) {
    codingBarInputValue = codingBarInput.value;

    if (event.key === 'Enter') {
        event.preventDefault();
        codingBarNewParentButton.click();
        hideCodingBar();
    }
});

function hideCodingBar() {
    const codingBar = document.getElementById('codingBar');
    codingBar.style.display = 'none';
}
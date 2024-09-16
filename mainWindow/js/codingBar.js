const codingBar = document.getElementById('codingBar');
const codingBarInput = document.getElementById('codeInput');
let codingBarInputValue;
const codingBarNewParentButton = document.getElementById('addCodeButton');
const codingBarNewSubcodeButton = document.getElementById('addSubCodeButton');

function showCodeBar(barLeft, barTop) {
    codingBar.style.left = `${barLeft}px`;
    codingBar.style.top = `${barTop + 60}px`;
    codingBar.style.display = 'flex';
    codingBarInput.focus();
    hideFormattingBar();
}

codingBarInput.addEventListener('keyup', function (event) {
    codingBarInputValue = codingBarInput.value;

    if (event.key === 'Enter') {
        event.preventDefault();
        codingBarNewParentButton.click();
        hideCodingBar();
    }
});

codingBarNewParentButton.addEventListener('click', function () {
    if (codingBarInput.value.trim() === '') {
        codingBarInput.focus();
        return;
    }

    // let editor = activeTab.editor;
    let codeName = codingBarInput.value.trim();

    // let start = editor.getCursor("start");
    // let end = editor.getCursor("end");

    processCode(codeName);

    hideCodingBar();
    codingBarInput.value = '';
});

function hideCodingBar() {
    codingBar.style.display = 'none';
}
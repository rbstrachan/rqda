const codingBar = document.getElementById('codingBar');
const codingBarInput = document.getElementById('codeInput');
let codingBarInputValue;
const codingBarNewParentButton = document.getElementById('addCodeButton');
const codingBarNewSubcodeButton = document.getElementById('addSubCodeButton');
// let codes = [];

function showCodeBar(barLeft, barTop) {
    codingBar.style.left = `${barLeft}px`;
    codingBar.style.top = `${barTop + 60}px`;
    codingBar.style.display = 'flex';
    codingBarInput.focus();
    hideFormattingBar();
}

// function updateCodesList() {
//     const codesList = document.getElementById('codesList');
//     codesList.innerHTML = '';
//     codes.forEach((code, index) => {
//         const codeElement = document.createElement('div');
//         codeElement.classList.add('code');
//         codeElement.innerHTML = `
//             <span class="code-name">${code.code}</span>
//             <span class="code-content">${code.content}</span>
//         `;
//         codesList.appendChild(codeElement);
//     });
// }

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

// ***

let codedSections = [];
let codedSectionId = 1;

codingBarNewParentButton.addEventListener('click', function () {
    if (codingBarInput.value.trim() === '') {
        return;
    }

    let activeTab = tabs.find(tab => tab.element.classList.contains('active-tab'));

    let editor = activeTab.editor;
    let codedSections = activeTab.codedSections;
    let codeName = codingBarInput.value.trim();

    console.log('codingBarNewParentButton clicked');

    let start = editor.getCursor("start");
    let end = editor.getCursor("end");

    editor.markText(start, end, {
        className: 'code-highlight',
        attributes: { 'code': codeName }
    });

    codedSections.push({
        id: codedSections.length + 1,
        start: start,
        end: end,
        code: codeName
    });

    hideCodingBar();
    codingBarInput.value = '';
});

function loadCodedMetadata(tab) {
    let editor = tab.editor;
    let codedSections = tab.codedSections;

    codedSections.forEach(section => {
        editor.markText(section.start, section.end, {
            className: 'code-highlight',
            attributes: { 'code': section.code }
        });
    });
}




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

// function highlightSelection(codeName) {
//     const editor = document.querySelector('.CodeMirror').CodeMirror;
//     const doc = editor.getDoc();
//     const selection = doc.getSelection();

//     const code = codeName;
//     if (code) {
//         const markedText = doc.markText(doc.getCursor('start'), doc.getCursor('end'), {
//             className: 'code-highlight',
//             attributes: {
//                 'code': code
//             }
//         });
//         codes.push({ code, content: selection })
//         updateCodesList();
//         codingBarInput.value = '';
//     }
// }

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

// codingBarNewParentButton.addEventListener('click', function () {
//      highlightSelection(codingBarInputValue);
// });

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

    // Get the start and end positions of the selected text
    let start = editor.getCursor("start");
    let end = editor.getCursor("end");

    // Mark the text in CodeMirror using a CSS class for highlighting
    editor.markText(start, end, {
        className: 'code-highlight',
        attributes: { 'code': codeName }
    });

    // Store the coding metadata in the codedSections array
    codedSections.push({
        id: codedSections.length + 1,  // Unique ID for each coded section
        start: start,          // Start position (line and character)
        end: end,              // End position (line and character)
        code: codeName         // The code assigned to the selected text
    });

    console.log(codedSections); // Debug to see what's getting stored

    // Clear the input field for the next code
    hideCodingBar();
    codingBarInput.value = '';
});

// function saveCodedMetadata() {
//     let metadata = JSON.stringify(codedSections);
//     // Here, you would write the metadata to a file or a database
//     console.log('Saving metadata:', metadata);
//     return metadata;
// }

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




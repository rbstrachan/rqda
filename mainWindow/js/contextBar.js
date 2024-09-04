const formattingBar = document.getElementById('formattingBar');
const boldButton = document.getElementById('boldButton');
const italicButton = document.getElementById('italicButton');
const underlineButton = document.getElementById('underlineButton');
const strikethroughButton = document.getElementById('strikethroughButton');
const codeButton = document.getElementById('codeTextButton');
let barLeft;
let barTop;

editorContainer.addEventListener('mouseup', function (event) {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        formattingBar.style.display = 'block';
        barLeft = mouseX + scrollX - (formattingBar.offsetWidth / 2);
        formattingBar.style.left = `${barLeft}px`;

        barTop = mouseY + scrollY - formattingBar.offsetHeight - 10;
        formattingBar.style.top = `${barTop}px`;
    } else {
        hideFormattingBar();
    }
});

document.addEventListener('mousedown', function (event) {
    if (!formattingBar.contains(event.target)) {
        hideFormattingBar();
    }
});

/* event listeners for contextBar buttons */
boldButton.addEventListener('click', boldSelection);

italicButton.addEventListener('click', italicSeletion);

// underlineButton.addEventListener('click', underlineSelection);

// strikethroughButton.addEventListener('click', strikethroughSelection);

codeButton.addEventListener('click', () => {
    codeText(barLeft, barTop);
});

/* formatting and coding function definitions */
function boldSelection() {
    const editor = document.querySelector('.CodeMirror').CodeMirror;
    const doc = editor.getDoc();
    const selection = doc.getSelection();

    doc.replaceSelection(`**${selection}**`);

    editor.focus();
    hideFormattingBar();
}

function italicSeletion() {
    const editor = document.querySelector('.CodeMirror').CodeMirror;
    const doc = editor.getDoc();
    const selection = doc.getSelection();

    doc.replaceSelection(`*${selection}*`);

    editor.focus();
    hideFormattingBar();
}

// function underlineSelection() {
//     const editor = document.querySelector('.CodeMirror').CodeMirror;
//     const doc = editor.getDoc();
//     const selection = doc.getSelection();

//     doc.replaceSelection(`<u>${selection}</u>`);

//     editor.focus();
//     hideFormattingBar();
// }

// function strikethroughSelection() {
//     const editor = document.querySelector('.CodeMirror').CodeMirror;
//     const doc = editor.getDoc();
//     const selection = doc.getSelection();

//     doc.replaceSelection(`~~${selection}~~`);

//     editor.focus();
//     hideFormattingBar();
// }

function hideFormattingBar() {
    formattingBar.style.display = 'none';
}
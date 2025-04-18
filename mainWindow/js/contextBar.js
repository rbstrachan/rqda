const formattingBar = document.getElementById('formattingBar');
const boldButton = document.getElementById('boldButton');
const italicButton = document.getElementById('italicButton');
const underlineButton = document.getElementById('underlineButton');
const strikethroughButton = document.getElementById('strikethroughButton');
const codeButton = document.getElementById('codeTextButton');
let barLeft;
let barTop;

editorContainer.addEventListener('mouseup', function (event) {
    if (!getActiveTab().path) {
        return;
    }

    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        formattingBar.style.display = 'block';
        barLeft = mouseX + scrollX - (formattingBar.offsetWidth / 2);
        formattingBar.style.left = `${barLeft}px`;

        barTop = mouseY + scrollY - formattingBar.offsetHeight - 15;
        formattingBar.style.top = `${barTop}px`;
    } else {
        hideFormattingBar();
    }
});

/* event listeners for contextBar buttons */
boldButton.addEventListener('click', () => {
    formatSelection('Bold');
});

italicButton.addEventListener('click', () => {
    formatSelection('Italic');
});

underlineButton.addEventListener('click', () => {
    formatSelection('Underline');
});

strikethroughButton.addEventListener('click', () => {
    formatSelection('Strike');
});

codeButton.addEventListener('click', () => {
    showCodeBar(barLeft, barTop);
});

/* formatting and coding function definitions */
function formatSelection(operation) {
    const editor = getActiveTab().editor
    const doc = editor.getDoc();

    const start = doc.getCursor('start');
    const end = doc.getCursor('end');
    const marks = doc.findMarks(start, end);
    let isOperation = false;

    marks.forEach(mark => {
        if (mark.className === `inner${operation}`) {
            isOperation = true;
            mark.clear();
        }
    });

    if (!isOperation) {
        doc.markText(start, end, {
            className: `inner${operation}`,
        });
        // console.log(`text marked from ${start} to ${end} with ${operation}`);
        // console.log(start, end, operation, doc);
    }

    editor.focus();
    hideFormattingBar();
}

function hideFormattingBar() {
    formattingBar.style.display = 'none';
}
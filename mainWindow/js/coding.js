let codesJSON = {
    codes: []
};

function processCode() {
    const activeTab = getActiveTab();
    const cursorSelection = {
        start: activeTab.editor.getCursor('start'),
        end: activeTab.editor.getCursor('end')
    };

    createCode(codingBarInputValue, cursorSelection, activeTab.path);

    const code = codesJSON.codes.find(code => code.name === normalize(codingBarInputValue));
    const excerpt = code.codedExcerpts[code.codedExcerpts.length - 1];
    const marker = highlightCodedText(activeTab.editor, excerpt.start, excerpt.end);

    // excerpt.marker = marker;
}

function getActiveTab() {
    return tabs.find(tab => tab.element.classList.contains('active-tab'));
}

function createCode(codeName, excerpt, filePath) {
    const normalisedCodeName = normalize(codeName);

    let code = codesJSON.codes.find(code => code.name === normalisedCodeName);

    if (!code) {
        code = {
            id: Date.now(),
            name: normalisedCodeName,
            codedExcerpts: []
        };
        codesJSON.codes.push(code);
    }

    code.codedExcerpts.push({
        id: Date.now(),
        start: excerpt.start,
        end: excerpt.end,
        // marker: null,
        filePath: filePath
    });

    saveCodesJSON(normalize(currentProjectTitle), codesJSON);
}

function saveCodesJSON(projectName, codesJSON) {
    window.api.saveCodesJSON(projectName, codesJSON);
}

async function loadCodesJSON(projectName) {
    const result = await window.api.loadCodesJSON(normalize(projectName));
    if (result) {
        codesJSON = result;
        console.log(codesJSON);
    }
}

function applyHighlightsToCodedText() {
    const activeTab = getActiveTab();
    const codedExcerpts = [];

    codesJSON.codes.forEach(code => {
        code.codedExcerpts.forEach(excerpt => {
            if (excerpt.filePath === activeTab.path) {
                codedExcerpts.push(excerpt);
            }
        });
    });

    console.log(codedExcerpts);
    codedExcerpts.forEach(excerpt => {
        highlightCodedText(activeTab.editor, excerpt.start, excerpt.end);
    });
}

function highlightCodedText(editor, start, end) {
    const marker = editor.markText(start, end, {
        // className: 'cm-highlight'
        className: 'code-highlight'
    });
    return marker;
}

function normalize(text) {
    return text.replace(/\s+/g, '-');
}

function denormalize(text) {
    return text.replace(/-/g, ' ');
}
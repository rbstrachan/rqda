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
    loadCodesJSON(currentProjectTitle);
}

function updateUI() {
    applyHighlightsToCodedText();
    updateCodesList();
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
        extract: getActiveTab().editor.getRange(excerpt.start, excerpt.end),
        // marker: marker,
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
    }

    updateUI();
}

function applyHighlightsToCodedText() {
    const activeTab = getActiveTab();
    const codedExcerpts = [];

    activeTab.editor.getAllMarks().forEach(mark => mark.clear());

    codesJSON.codes.forEach(code => {
        code.codedExcerpts.forEach(excerpt => {
            if (excerpt.filePath === activeTab.path) {
                codedExcerpts.push(excerpt);
            }
        });
    });

    codedExcerpts.forEach(excerpt => {
        highlightCodedText(activeTab.editor, excerpt.start, excerpt.end);
    });
}

function highlightCodedText(editor, start, end) {
    const marker = editor.markText(start, end, {
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
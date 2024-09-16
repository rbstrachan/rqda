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

    const code = codesJSON.codes.find(code => code.name === normalizeCodeName(codingBarInputValue));
    const excerpt = code.codedExcerpts[code.codedExcerpts.length - 1];
    const marker = highlightCodedText(activeTab.editor, excerpt.start, excerpt.end);

    excerpt.marker = marker;
}

function getActiveTab() {
    return tabs.find(tab => tab.element.classList.contains('active-tab'));
}

function createCode(codeName, excerpt, filePath) {
    const normalisedCodeName = normalizeCodeName(codeName);

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
        marker: null,
        filePath: filePath
    });
}

function highlightCodedText(editor, start, end) {
    const marker = editor.markText(start, end, {
        // className: 'cm-highlight'
        className: 'code-highlight'
    });
    return marker;
}

function normalizeCodeName(codeName) {
    return codeName.replace(/\s+/g, '_');
}

function denormalizeCodeName(codeName) {
    return codeName.replace(/_/g, ' ');
}
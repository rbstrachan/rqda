const formatDict = {
    'b': 'Bold',
    'i': 'Italic',
    'u': 'Underline',
    // 's': 'Strike',
    // 'Subscript': 'subscript',
    // 'Superscript': 'superscript',
    // 'JustifyLeft': 'justifyLeft',
    // 'JustifyCenter': 'justifyCenter',
    // 'JustifyRight': 'justifyRight',
    // 'JustifyFull': 'justifyFull',
    // 'InsertOrderedList': 'insertOrderedList',
    // 'InsertUnorderedList': 'insertUnorderedList',
    // 'Outdent': 'outdent',
    // 'Indent': 'indent',
    // 'InsertHorizontalRule': 'insertHorizontalRule',
    // 'InsertImage': 'insertImage',
    // 'CreateLink': 'createLink',
    // 'Unlink': 'unlink',
    // 'InsertTable': 'insertTable',
    // 'InsertParagraph': 'insertParagraph',
    // 'InsertText': 'insertText',
    // 'FontName': 'fontName',
    // 'FontSize': 'fontSize',
    // 'ForeColor': 'foreColor',
    // 'BackColor': 'backColor',
    // 'ClearFormatting': 'clearFormatting',
    // 'Print': 'print',
    // 'Undo': 'undo',
    // 'Redo': 'redo',
    // 'Cut': 'cut',
    // 'Copy': 'copy',
    // 'Paste': 'paste',
    // 'SelectAll': 'selectAll'
};

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && ['b', 'i', 'u'].includes(event.key)) {
        event.preventDefault();
        formatSelection(formatDict[event.key]);
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
    }
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveTabContentsToFile(getActiveTab());
    }
});
const codesList = document.getElementById('codesList');
const codesListContainer = document.querySelector('.codes');

function updateCodesList(selectedCodeId = null) {
    codesList.innerHTML = '';

    const sortedCodes = codesJSON.codes.sort((a, b) => {
        const nameA = denormalize(a.name).toLowerCase();
        const nameB = denormalize(b.name).toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedCodes.forEach(code => {
        const codeElement = document.createElement('div');
        codeElement.classList.add('code-item');

        if (code.id === selectedCodeId) {
            codeElement.classList.add('selected');
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = denormalize(code.name);
        codeElement.appendChild(nameSpan);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons-container');

        const buttons = [
            { action: 'rename', icon: renameIcon, title: 'Renommer' },
            { action: 'delete', icon: deleteIcon, title: 'Supprimer' },
            // { action: 'merge', icon: mergeIcon, title: 'Fusionner' },
            { action: 'open', icon: openIcon, title: 'Ouvrir' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.classList.add('code-item-button');
            button.setAttribute('aria-label', btn.title);
            button.innerHTML = btn.icon;

            button.addEventListener('click', function (event) {
                handleCodeItemButtonClick(btn.action, code, codeElement);
            });

            buttonsContainer.appendChild(button);
        });

        codeElement.appendChild(buttonsContainer);

        codeElement.addEventListener('click', function (event) {
            document.querySelectorAll('.code-item').forEach(item => item.classList.remove('selected'));
            codeElement.classList.add('selected');
        });

        codesList.appendChild(codeElement);
    });
}

codesListContainer.addEventListener('click', function (event) {
    if (event.target === codesListContainer) {
        document.querySelectorAll('.code-item.selected').forEach(item => item.classList.remove('selected'));
    }
});

function handleCodeItemButtonClick(action, code, codeElement) {
    switch (action) {
        case 'open':
            openCode(code);
            break;
        case 'rename':
            renameCode(code, codeElement);
            break;
        // case 'merge':
        //     mergeCode(code);
        //     break;
        case 'delete':
            deleteCode(code);
            break;
        default:
            console.warn('Unknown action:', action);
    }
}

function renameCode(code, codeElement) {
    if (!code) {
        return;
    }

    const nameSpan = codeElement.querySelector('span');

    const input = document.createElement('input');
    input.type = 'text';
    input.value = denormalize(code.name);
    input.classList.add('code-rename-input');

    codeElement.replaceChild(input, nameSpan);

    input.focus();
    input.select();

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const newName = input.value.trim();
            if (newName && newName !== denormalize(code.name)) {
                const duplicate = codesJSON.codes.find(c => denormalize(c.name) === newName && c.id !== code.id);
                if (duplicate) {
                    return;
                }

                code.name = normalize(newName);
                saveCodesJSON(normalize(currentProjectTitle), codesJSON);
                loadCodesJSON(currentProjectTitle);
            }

            updateCodesList(code.id);
        }
        if (event.key === 'Escape') { updateCodesList(code.id); }
    });

    setTimeout(() => {
        document.addEventListener('click', clickOutsideHandler);
    }, 0);

    function clickOutsideHandler(event) {
        if (event.target !== input) {
            updateCodesList(code.id);
            document.removeEventListener('click', clickOutsideHandler);
        }
    }
}

function deleteCode(code) {
    if (!code) {
        return;
    }

    codesJSON.codes = codesJSON.codes.filter(c => c.id !== code.id);
    saveCodesJSON(normalize(currentProjectTitle), codesJSON);
    loadCodesJSON(currentProjectTitle);

    if (getActiveTab() && !checkIfFileHasCodes(getActiveTab().path)) {
        getActiveTab().editor.setOption('readOnly', false);
        getActiveTab().editor.getWrapperElement().classList.remove('cm-readonly');
    }
}

// function mergeCode(code) {
//     console.log('Merge code:', code);
// }

function openCode(code) {
    if (!code) {
        return;
    }

    const excerptsList = code.codedExcerpts.map(excerpt => {
        const relPath = excerpt.filePath.replace(currentProjectDirectory, '').slice(1);

        return {
            extract: excerpt.extract,
            filePath: relPath,
            timeCoded: new Date(excerpt.id).toLocaleString()
        }
    });

    let content = `# EXTRAITS CODÉS AVEC "${denormalize(code.name).toUpperCase()}"`;

    excerptsList.forEach(data => {
        content += `\n\n**${data.filePath}**\t(${data.timeCoded})\n\n`;
        content += `${data.extract}\n\nーーー`;
    });

    addNewTab(denormalize(code.name), content, null);
}

function getActiveCode() {
    const selectedCodeElement = getActiveCodeElement();
    if (!selectedCodeElement) {
        return null;
    }

    const codeName = selectedCodeElement.querySelector('span').textContent;
    return codesJSON.codes.find(code => denormalize(code.name) === codeName);
}

function getActiveCodeElement() {
    return document.querySelector('.code-item.selected');
}

const renameIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-cursor-input"><path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1"/><path d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M9 7v10"/></svg>';
const deleteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
// const mergeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-merge"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>';
const openIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>';
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
    codesJSON.codes = codesJSON.codes.filter(c => c.id !== code.id);
    saveCodesJSON(normalize(currentProjectTitle), codesJSON);
    updateUI();
}

// function mergeCode(code) {
//     console.log('Merge code:', code);
// }

function openCode(code) {
    const excerptsList = code.codedExcerpts.map(excerpt => {
        return {
            extract: excerpt.extract,
            filePath: excerpt.filePath,
            timeCoded: new Date(excerpt.id).toLocaleString()
        }
    });

    let content = `# EXTRAITS CODÉS AVEC "${denormalize(code.name).toUpperCase()}"`;

    excerptsList.forEach(data => {
        content += `\n\n**${data.filePath}**\t(${data.timeCoded})\n`;
        content += `${data.extract}\n\nーーー`;
    });

    addNewTab(denormalize(code.name), content, null);
}

const renameIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>';
const deleteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
// const mergeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-merge"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>';
const openIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>';
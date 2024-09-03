/* NEED TO ADD:
- KEEP MENUBUTTON ILLUMATED WHILE MENU IS OPEN, EVEN IF CURSOR IS NOT IN MENU
- AUTOMATICALLY CHANGE MENUS IF CURSOR GOES OVER ANOTHER MENUBUTTON
- MAKE THE ACCELERATORS LOOK LIKE KEYBOARD KEYS
    - SEE BOUNCINGKEYS P5JS SKETCH
    - SEE PHONE SCREENSHOTS
- MENUS WITHIN MENUS?
*/

// menu structure object
// MUST ALSO UPDATE handleMenuAction FUNCTION ON CHANGE OF THIS OBJECT
const menuStructure = {
    'Projet': {
        // width: '300px',
        items: [
            // { text: 'Nouveau projet', icon: 'plus', accelerator: 'Ctrl+N' },
            { text: 'Ouvrir un projet...', icon: 'folder-open', accelerator: 'Ctrl+O' },
            /*'separator',
            { text: 'Enregistrer', icon: 'disk', accelerator: 'Ctrl+S' },
            { text: 'Enregistrer sous…', icon: 'disk', accelerator: 'Ctrl+Shift+S' },*/
        ],
    },
    'Fichier': {
        items: [
            { text: 'Nouveau fichier', icon: 'new-file', accelerator: '' },
            /*{ text: 'Importer des fichiers...', icon: 'import-file', accelerator: '' },
            { text: 'Importer des dossiers...', icon: 'import-folder', accelerator: '' },
            { text: 'Dupliquer', icon: 'duplicate', accelerator: '' },
            'separator',
            { text: 'Renommer', icon: 'rename', accelerator: '' },
            { text: 'Déplacer', icon: 'move', accelerator: '' },*/
            'separator',
            { text: 'Enregister' },
            /*{ text: 'Enregistrer sous…' },
            { text: 'Exporter' },
            'separator',
            { text: 'Imprimer', icon: 'print', accelerator: '' },
            { text: 'Envoyer par email', icon: 'send', accelerator: '' },*/
            // { text: 'Télécharger' },
            /*'separator',
            { text: 'Fermer', icon: 'circle-x', accelerator: '' },
            { text: 'Supprimer', icon: 'delete', accelerator: '' }*/
        ],
    },
    /*'Édition': {
        // width: '300px',
        items: [
            { text: 'Annuler', icon: 'undo', accelerator: 'Ctrl+Z' },
            { text: 'Rétablir', icon: 'redo', accelerator: 'Ctrl+Y' },
            'separator',
            { text: 'Copier', icon: 'copy', accelerator: 'Ctrl+C' },
            { text: 'Coller', icon: 'paste', accelerator: 'Ctrl+V' },
            { text: 'Coller texte brut', icon: 'paste-text', accelerator: 'Ctrl+Shift+V' },
            { text: 'Couper', icon: 'cut', accelerator: 'Ctrl+X' },
            'separator',
            { text: 'Sélectionner tout', icon: 'select-all', accelerator: 'Ctrl+A' },
            { text: 'Rechercher...', icon: 'search', accelerator: 'Ctrl+F' },
            { text: 'Remplacer...', icon: 'replace', accelerator: 'Ctrl+H' },
            'separator',
            { text: 'Préférences...', icon: 'settings' },
        ],
    },
    'Affichage': {
        items: [
            { text: 'Zoom avant', icon: 'zoom-in', accelerator: 'Ctrl++' },
            { text: 'Zoom arrière', icon: 'zoom-out', accelerator: 'Ctrl+-' },
            { text: 'Réinitialiser le zoom', icon: 'reset-zoom', accelerator: 'Ctrl+0' }
        ],
    },
    'Codage': {
        items: [
            { text: 'Ajouter une catégorie', icon: 'category', accelerator: '' },
            { text: 'Ajouter un code parent', icon: 'parent', accelerator: '' },
            { text: 'Ajouter un code enfant', icon: 'child', accelerator: '' },
            'separator',
            { text: 'Renommer', icon: 'rename', accelerator: '' },
            { text: 'Déplacer', icon: 'move', accelerator: '' },
            // 'separator',
            // { text: 'Importer' },
            // { text: 'Exporter' },
            'separator',
            { text: 'Supprimer', icon: 'delete', accelerator: '' },
        ],
    },
    'Fenêtre': {
        items: [
            { text: 'Plein écran', icon: 'fullscreen', accelerator: 'F11' },
            { text: 'Fenêtre normale', icon: 'normal', accelerator: 'Esc' },
            { text: 'Réduire', icon: 'minimize', accelerator: '' },
            'separator',
            { text: 'Fermer la fenêtre', icon: 'circle-x', accelerator: '' },
            // { text: 'Fermer toutes les fenêtres' },
        ],
    },
    'Aide': {
        items: [
            { text: 'À propos', icon: 'about', accelerator: '' },
            'separator',
            { text: 'Documentation', icon: 'documentation', accelerator: '' },
            { text: 'Tutoriel', icon: 'tutorial', accelerator: '' },
            'separator',
            { text: 'FAQ', icon: 'faq', accelerator: '' },
            { text: 'Contacter', icon: 'contact', accelerator: '' },
            'separator',
            { text: 'Signaler un problème', icon: 'report-issue', accelerator: '' },
            // { text: 'Faire une suggestion', icon: 'suggest', accelerator: '' },
            { text: 'Demander une fonction', icon: 'request', accelerator: '' },
            'separator',
            { text: 'Soutenir le projet', icon: 'support', accelerator: '' },
        ],
    },*/
    // 'Parametres': {
    //     items: [
    //         { text: 'Changer de langue' },
    //         { text: 'Changer de thème' },
    //         { text: 'Changer de police' },
    //         'separator',
    //         { text: 'Mettre à jour' },
    //         { text: 'Rechercher des mises à jour' },
    //         { text: "Installer les mises à jour" }
    //     ]
    // }
};

// Function to generate menus
function generateMenus(menuStructure) {
    const menus = document.getElementById('menus');
    menus.innerHTML = '';

    for (const [menuTitle, menu] of Object.entries(menuStructure)) {
        const menuButton = document.createElement('div');
        menuButton.className = 'menuButton';
        menuButton.innerText = menuTitle;

        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdownMenu';
        // dropdownMenu.style.width = menu.width || '250px';
        dropdownMenu.style.width = '200px';

        menu.items.forEach(item => {
            if (item === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'separator';
                dropdownMenu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'menuItem';
                menuItem.id = item.text.replace(/ /g, '-').toLowerCase();

                const iconSpan = document.createElement('span');
                iconSpan.className = 'icon';
                if (item.icon) {
                    iconSpan.innerHTML = getIconSVG(item.icon);
                }

                const itemText = document.createElement('span');
                itemText.className = 'itemText';
                itemText.innerText = item.text;

                const acceleratorSpan = document.createElement('span');
                acceleratorSpan.className = 'accelerator';
                // if (item.accelerator) {
                //     acceleratorSpan.innerHTML = item.accelerator.split('+').map(key => `<span class="key">${key}</span>`).join('');
                // }

                menuItem.appendChild(iconSpan);
                menuItem.appendChild(itemText);
                menuItem.appendChild(acceleratorSpan);

                menuItem.addEventListener('click', function () {
                    if (menuItem.classList.contains('disabled')) return;
                    handleMenuAction(menuTitle, item.text);
                });

                dropdownMenu.appendChild(menuItem);
            }
        });

        menuButton.appendChild(dropdownMenu);
        menus.appendChild(menuButton);
    }

    attachMenuEventListeners();

    // disable menu buttons that cannot be used on application launch
    disableMenuButtonsOnStartup();
}

function disableMenuButtonsOnStartup() {
    // active only when a project is open
    disableMenuButton('Nouveau projet');

    // active only when multiple windows are open
    disableMenuButton('Fermer toutes les fenêtres');
}

function handleMenuAction(menu, action) {
    switch (menu) {
        case 'Projet':
            switch (action) {
                case 'Nouveau projet':
                    // window.api.closeProject().then(result => {
                    //     if (result.response !== 2) {
                    //         if (result.reponse === 0) {
                    //             // implement project saving here
                    //         }
                    //         windowTitleStyle.setProperty('--projectTitle', '');
                    //         clearDirectoryTree();
                    //         closeAllTabs();
                    //         disableMenuButton('Nouveau projet');
                    //     }
                    // });
                    break;
                case 'Ouvrir un projet...':
                    window.api.openFolderDialog().then(folderPath => {
                        if (folderPath) {
                            openProjectInFileTree(folderPath);
                        }
                    });
                    break;
                case 'Enregistrer':
                    break;
                case 'Enregistrer sous…':
                    break;
                default:
                    console.log(`No action defined for ${action} under ${menu}`);
            }
            break;
        case 'Fichier':
            switch (action) {
                case 'Nouveau fichier':
                    window.api.saveDialog({ defaultPath: currentProjectDirectoy }).then(result => {
                        if (result) {
                            const { filePath, fileName } = result;
                            window.api.createFile(filePath).then(() => {
                                updateFileTree();
                                window.api.readFile(filePath).then(content => {
                                    addNewTab(fileName, content, filePath);
                                });
                            });
                        }
                    });
                    // addNewTab('Nouveau fichier');
                    break;
                case 'Importer des fichiers...':
                    break;
                case 'Importer des dossiers...':
                    break;
                case 'Dupliquer':
                    break;
                case 'Renommer':
                    break;
                case 'Déplacer':
                    break;
                case 'Enregister':
                    break;
                case 'Enregistrer sous…':
                    break;
                case 'Imprimer':
                    break;
                case 'Envoyer par email':
                    break;
                case 'Fermer':
                    // closeTab();
                    break;
                case 'Supprimer':
                    break;
                default:
                    console.log(`No action defined for ${action} under ${menu}`);
            }
            break;
        case 'Edition':
            switch (action) {
                case 'Annuler':
                    break;
                case 'Rétablir':
                    break;
                case 'Copier':
                    break;
                case 'Coller':
                    break;
                case 'Coller texte brut':
                    break;
                case 'Couper':
                    break;
                case 'Sélectionner tout':
                    break;
                case 'Rechercher...':
                    break;
                case 'Remplacer...':
                    break;
                case 'Préférences...':
                    break;
                default:
                    console.log(`No action defined for ${action} under ${menu}`);
            }
            break;
        case 'Affichage':
            switch (action) {
                case 'Zoom avant':
                    break;
                case 'Zoom arrière':
                    break;
                case 'Réinitialiser le zoom':
                    break;
                default:
                    console.log(`No action defined for ${action} under ${menu}`);
            }
            break;
        case 'Codage':
            switch (action) {
                case 'Ajouter une catégorie':
                    break;
                case 'Ajouter un code parent':
                    break;
                case 'Ajouter un code enfant':
                    break;
                case 'Renommer':
                    break;
                case 'Déplacer':
                    break;
                case 'Supprimer':
                    break;
                default:
                    console.log(`No action defined for ${action} under ${menu}`);
            }
            break;
        case 'Fenêtre':
            switch (action) {
                case 'Plein écran':
                    break;
                case 'Fenêtre normale':
                    break;
                case 'Réduire':
                    break;
                case 'Fermer la fenêtre':
                    break;
                case 'Fermer toutes les fenêtres':
                    break;
                default:
                    console.log(`No action defined for ${action} under ${menu}`);
            }
            break;
        case 'Aide':
            switch (action) {
                case 'À propos':
                    break;
                case 'Documentation':
                    break;
                case 'Tutoriel':
                    break;
                case 'FAQ':
                    break;
                case 'Contacter':
                    break;
                case 'Signaler un problème':
                    break;
                case 'Faire une suggestion':
                    break;
                case 'Demander une fonction':
                    break;
                case 'Soutenir le projet':
                    break;
                default:
                    console.log(`No action defined for ${action} under ${menu}`);
            }
            break;
        default:
            console.log(`No action defined for ${action} under ${menu}`);
    }
}

function getIconSVG(iconName) {
    const icons = {
        // projet
        'plus': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
        'folder-open': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>',
        'circle-x': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
        'disk': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>',

        // fichier
        'new-file': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>',
        'import-file': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-down"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>',
        'import-folder': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-down"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="M12 10v6"/><path d="m15 13-3 3-3-3"/></svg>',
        'duplicate': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers-2"><path d="m16.02 12 5.48 3.13a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74L7.98 12"/><path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74Z"/></svg>',
        'rename': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-cursor-input"><path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1"/><path d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M9 7v10"/></svg>',
        'move': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-tree"><path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg>',
        'print': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>',
        'send': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-horizontal"><path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/></svg>',
        'delete': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',

        // edition
        'undo': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>',
        'redo': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo-2"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>',
        'copy': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
        'paste': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
        'paste-text': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-type"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12v-1h6v1"/><path d="M11 17h2"/><path d="M12 11v6"/></svg>',
        'cut': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scissors"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>',
        'select-all': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-select"><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h1"/><path d="M14 3h1"/><path d="M14 21h1"/><path d="M3 9v1"/><path d="M21 9v1"/><path d="M3 14v1"/><path d="M21 14v1"/><line x1="7" x2="15" y1="8" y2="8"/><line x1="7" x2="17" y1="12" y2="12"/><line x1="7" x2="13" y1="16" y2="16"/></svg>',
        'search': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
        'replace': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-replace"><path d="M14 4a2 2 0 0 1 2-2"/><path d="M16 10a2 2 0 0 1-2-2"/><path d="M20 2a2 2 0 0 1 2 2"/><path d="M22 8a2 2 0 0 1-2 2"/><path d="m3 7 3 3 3-3"/><path d="M6 10V5a3 3 0 0 1 3-3h1"/><rect x="2" y="14" width="8" height="8" rx="2"/></svg>',
        'settings': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',

        // affichage
        'zoom-in': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>',
        'zoom-out': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-out"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>',
        'reset-zoom': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fullscreen"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="10" height="8" x="7" y="8" rx="1"/></svg>',

        // codage
        'category': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-git-2"><path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5"/><circle cx="13" cy="12" r="2"/><path d="M18 19c-2.8 0-5-2.2-5-5v8"/><circle cx="20" cy="19" r="2"/></svg>',
        'parent': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-commit-vertical"><path d="M12 3v6"/><circle cx="12" cy="12" r="3"/><path d="M12 15v6"/></svg>',
        'child': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-merge"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>',

        // fenêtre
        'fullscreen': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>',
        'normal': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize-2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>',
        'minimize': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>',

        // aide
        'about': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        'documentation': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        'tutorial': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-milestone"><path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"/><path d="M12 13v8"/><path d="M12 3v3"/></svg>',
        'faq': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-help"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
        'contact': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-at-sign"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>',
        'report-issue': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
        'request': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-pull-request-create-arrow"><circle cx="5" cy="6" r="3"/><path d="M5 9v12"/><path d="m15 9-3-3 3-3"/><path d="M12 6h5a2 2 0 0 1 2 2v3"/><path d="M19 15v6"/><path d="M22 18h-6"/></svg>',
        'support': '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-heart"><path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/></svg>',
    };
    return icons[iconName] || '';
}

function toggleMenuButtonState(buttonText) {
    const menuItem = document.getElementById(buttonText.replace(/ /g, '-').toLowerCase());
    if (menuItem) { menuItem.classList.toggle('disabled') }
}

function enableMenuButton(buttonText) {
    const menuItem = document.getElementById(buttonText.replace(/ /g, '-').toLowerCase());
    if (menuItem) { menuItem.classList.remove('disabled') }
}

function disableMenuButton(buttonText) {
    const menuItem = document.getElementById(buttonText.replace(/ /g, '-').toLowerCase());
    if (menuItem) { menuItem.classList.add('disabled') }
}

function attachMenuEventListeners() {
    document.querySelectorAll('.menuButton').forEach(button => {
        button.addEventListener('click', function (e) {
            // Close any open menus first
            document.querySelectorAll('.dropdownMenu').forEach(menu => {
                if (menu !== button.querySelector('.dropdownMenu')) {
                    menu.style.display = 'none';
                }
            });

            // Toggle the visibility of the clicked menu
            const dropdown = this.querySelector('.dropdownMenu');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

            // Stop propagation to prevent closing the menu immediately
            e.stopPropagation();
        });
    });

    // close the dropdowns if clicked outside
    document.addEventListener('click', function () {
        document.querySelectorAll('.dropdownMenu').forEach(menu => {
            menu.style.display = 'none';
        });
    });
}

// call the function to generate menus on page load
generateMenus(menuStructure);

// list of menu button functions
let currentProjectDirectoy;
window.api.receive('open-project', (folderPath) => {
    currentProjectDirectoy = folderPath;
    openProjectInFileTree(folderPath);
});

function openProjectInFileTree(folderPath) {
    window.api.getDirTree(folderPath).then(directoryTree => {
        sortDirectoryTree(directoryTree);
        clearDirectoryTree();
        windowTitleStyle.setProperty('--projectTitle', `"${folderPath.split('/').pop()}" " ・ "`);
        renderFileTree(document.getElementById('fileTree'), directoryTree);
        enableMenuButton('Nouveau projet');
    });
}
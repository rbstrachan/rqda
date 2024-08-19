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
    "Projet": {
        items: [
            { text: "Nouveau projet", icon: "plus", accelerator: "Ctrl+N" },
            { text: "Ouvrir un projet...", icon: "folder-open", accelerator: "Ctrl+O" },
            "separator",
            { text: "Fermer le projet", icon: "circle-x", accelerator: "Ctrl+W" }
        ],
    },
    "Fichier": {
        items: [
            { text: "Nouveau fichier" },
            { text: "Importer des fichiers..." },
            { text: "Importer des dossiers..." },
            { text: "Dupliquer" },
            "separator",
            { text: "Renommer" },
            { text: "Déplacer" },
            "separator",
            { text: "Enregister" },
            { text: "Enregistrer sous…" },
            // { text: "Exporter" },
            "separator",
            { text: "Imprimer" },
            { text: "Envoyer par email" },
            // { text: "Télécharger" },
            "separator",
            { text: "Fermer" },
            { text: "Supprimer" }
        ],
    },
    "Édition": {
        width: "300px",
        items: [
            { text: "Annuler", accelerator: "Ctrl+Z" },
            { text: "Rétablir", accelerator: "Ctrl+Y" },
            "separator",
            { text: "Copier", accelerator: "Ctrl+C" },
            { text: "Coller", accelerator: "Ctrl+V" },
            { text: "Coller texte brut", accelerator: "Ctrl+Shift+V" },
            { text: "Couper", accelerator: "Ctrl+X" },
            "separator",
            { text: "Sélectionner tout", accelerator: "Ctrl+A" },
            { text: "Rechercher...", accelerator: "Ctrl+F" },
            { text: "Remplacer...", accelerator: "Ctrl+H" },
            "separator",
            { text: "Préférences..." },
        ],
    },
    "Affichage": {
        items: [
            { text: "Zoom avant", accelerator: "Ctrl++" },
            { text: "Zoom arrière", accelerator: "Ctrl+-" },
            { text: "Réinitialiser le zoom", accelerator: "Ctrl+0" }
        ],
    },
    "Codage": {
        items: [
            { text: "Ajouter une catégorie" },
            { text: "Ajouter un code parent" },
            { text: "Ajouter un code enfant" },
            "separator",
            { text: "Renommer" },
            { text: "Déplacer" },
            // "separator",
            // { text: "Importer" },
            // { text: "Exporter" },
            "separator",
            { text: "Supprimer" }
        ],
    },
    "Fenêtre": {
        items: [
            { text: "Plein écran", accelerator: "F11" },
            { text: "Fenêtre normale", accelerator: "Esc" },
            { text: "Réduire" },
            "separator",
            { text: "Fermer la fenêtre" },
            { text: "Fermer toutes les fenêtres" },
        ],
    },
    "Aide": {
        items: [
            { text: "À propos" },
            "separator",
            { text: "Documentation" },
            { text: "Tutoriel" },
            "separator",
            { text: "FAQ" },
            { text: "Contacter" },
            "separator",
            { text: "Signaler un problème" },
            { text: "Faire une suggestion" },
            { text: "Demander une fonction" },
            "separator",
            { text: "Soutenir le projet" },
        ],
    },
    // "Parametres": {
    //     items: [
    //         { text: "Changer de langue" },
    //         { text: "Changer de thème" },
    //         { text: "Changer de police" },
    //         "separator",
    //         { text: "Mettre à jour" },
    //         { text: "Rechercher des mises à jour" },
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
        dropdownMenu.style.width = menu.width || '250px';

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
                if (item.accelerator) {
                    acceleratorSpan.innerHTML = item.accelerator.split('+').map(key => `<span class="key">${key}</span>`).join('');
                }

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
}

function handleMenuAction(menu, action) {
    switch (menu) {
        case 'Projet':
            switch (action) {
                case 'Nouveau projet':
                    // todo: open a new window to create a new project
                    break;
                case 'Ouvrir un projet...':
                    window.api.openFolderDialog().then(folderPath => {
                        window.api.getDirTree(folderPath).then(directoryTree => {
                            clearDirectoryTree();
                            renderFileTree(document.getElementById('fileTree'), directoryTree);
                        });
                    });
                    break;
                case 'Fermer le projet':
                    clearDirectoryTree();
                    break;
                default:
                    console.log(`No action defined for ${action} under ${menu}`);
            }
            break;
        case 'Fichier':
            switch (action) {
                case 'Nouveau fichier':
                    // todo    
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
        "plus": `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
        "folder-open": `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>`,
        "circle-x": `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
    };
    return icons[iconName] || '';
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

    // Close the dropdowns if clicked outside
    document.addEventListener('click', function () {
        document.querySelectorAll('.dropdownMenu').forEach(menu => {
            menu.style.display = 'none';
        });
    });
}

function toggleMenuButtonState(buttonText) {
    const menuItem = document.getElementById(buttonText.replace(/ /g, '-').toLowerCase());
    if (menuItem) { menuItem.classList.toggle('disabled') }
}

// call the function to generate menus on page load
generateMenus(menuStructure);
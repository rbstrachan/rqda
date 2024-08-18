/* NEED TO ADD:
- KEEP MENUBUTTON ILLUMATED WHILE MENU IS OPEN, EVEN IF CURSOR IS NOT IN MENU
- AUTOMATICALLY CHANGE MENUS IS CURSOR GOES OVER ANOTHER MENUBUTTON
- MAKE THE ACCELERATORS LOOK LIKE KEYBOARD KEYS
    - SEE BOUNCINGKEYS P5JS SKETCH
    - SEE PHONE SCREENSHOTS
- MENUS WITHIN MENUS?
*/

const menuStructure = {
    "Projet": [
        { text: "Nouveau projet", icon: "plus", accelerator: "Ctrl+N" },
        { text: "Ouvrir un projet...", icon: "folder-open", accelerator: "Ctrl+O" },
        "separator",
        { text: "Fermer le projet", icon: "circle-x", accelerator: "Ctrl+W" }
    ],
    "Fichier": [
        { text: "Nouveau fichier" },
        { text: "Importer un fichier" },
        { text: "Dupliquer" },
        "separator",
        { text: "Renommer" },
        { text: "Déplacer" },
        "separator",
        { text: "Enregister" },
        { text: "Enregistrer sous…" },
        { text: "Exporter" },
        "separator",
        { text: "Imprimer" },
        { text: "Envoyer par email" },
        // { text: "Télécharger" },
        "separator",
        { text: "Fermer" },
        { text: "Supprimer" }
    ],
    "Edition": [
        { text: "Annuler", accelerator: "Ctrl+Z" },
        { text: "Rétablir", accelerator: "Ctrl+Y" },
        "separator",
        { text: "Copier", accelerator: "Ctrl+C" },
        { text: "Coller", accelerator: "Ctrl+V" },
        { text: "Coller texte brut", accelerator: "Ctrl+Shift+V" },
        { text: "Couper", accelerator: "Ctrl+X" },
        "separator",
        { text: "Sélectionner tout", accelerator: "Ctrl+A" },
        { text: "Rechercher", accelerator: "Ctrl+F" },
        { text: "Remplacer", accelerator: "Ctrl+H" },
        "separator",
        { text: "Préférences" },
    ],
    "Affichage": [
        { text: "Zoom avant", accelerator: "Ctrl++" },
        { text: "Zoom arrière", accelerator: "Ctrl+-" },
        { text: "Réinitialiser le zoom", accelerator: "Ctrl+0" }       
    ],
    "Codage": [
        { text: "Ajouter une catégorie" },
        { text: "Ajouter un code parent" },
        { text: "Ajouter un code enfant" },
        "separator",
        { text: "Renommer" },
        { text: "Déplacer" },
        "separator",
        { text: "Importer" },
        { text: "Exporter" },
        "separator",
        { text: "Supprimer" }
    ],
    "Fenêtre": [
        { text: "Plein écran", accelerator: "F11" },
        { text: "Fenêtre normale", accelerator: "Esc" },
        { text: "Réduire" },
        "separator",
        { text: "Fermer la fenêtre" },
        { text: "Fermer toutes les fenêtres" },
    ],
    "Aide": [
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
        // "separator",
        // { text: "Licence" },
        // { text: "Conditions d'utilisation" },
        // { text: "Politique de confidentialité" },
        "separator",
        { text: "Soutenir le projet" },
    ]
    // "Parametres": [
    //     { text: "Changer de langue" },
    //     { text: "Changer de thème" },
    //     { text: "Changer de police" },
    //     "separator",
    //     { text: "Mettre à jour" },
    //     { text: "Rechercher des mises à jour" },
    //     { text: "Installer les mises à jour" }
    // ]
};

// Function to generate menus
function generateMenus(menuStructure) {
    const menus = document.getElementById('menus');
    menus.innerHTML = '';

    for (const [menuTitle, menuItems] of Object.entries(menuStructure)) {
        const menuButton = document.createElement('div');
        menuButton.className = 'menuButton';
        menuButton.innerText = menuTitle;

        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdownMenu';

        menuItems.forEach(item => {
            if (item === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'separator';
                dropdownMenu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'menuItem';

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

                dropdownMenu.appendChild(menuItem);
            }
        });

        menuButton.appendChild(dropdownMenu);
        menus.appendChild(menuButton);
    }

    attachMenuEventListeners();
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

// call the function to generate menus on page load
generateMenus(menuStructure);

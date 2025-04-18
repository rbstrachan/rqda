// class Tab {
// 	constructor(id, title, content) {
// 		this.id = id;
// 		this.title = title;
// 		this.content = content;
// 		this.editor = null;
// 		this.element = null;
// 	}
// }

// const tabsContainer = document.getElementById('editorTabs');
// const tabs = [];

// function createTabElement(tab) {
// 	const tabElement = document.createElement('div');
// 	tabElement.classList.add('tab');

// 	// tab title
// 	const titleSpan = document.createElement('span');
// 	titleSpan.textContent = tab.title;
// 	tabElement.appendChild(titleSpan);

// 	// close button
// 	const closeButton = document.createElement('div');
// 	closeButton.textContent = '×';
// 	closeButton.classList.add('close');
// 	tabElement.appendChild(closeButton);

// 	closeButton.addEventListener('click', (event) => {
// 		event.stopPropagation();
// 		closeTab(tab);
// 	});

// 	tabElement.addEventListener('click', () => {
// 		activateTab(tab);
// 	});

// 	tab.element = tabElement;
// 	return tabElement;
// }

// function populateTabsContainer() {
// 	tabsContainer.innerHTML = '';
// 	tabs.forEach((tab) => {
// 		const tabElement = createTabElement(tab);
// 		tabsContainer.appendChild(tabElement);
// 	});
// 	if (tabs.length > 0) {
// 		activateTab(tabs[0]);
// 	}
// }

// function activateTab(tab) {
// 	tabs.forEach((otherTab) => {
// 		if (otherTab.editor) {
// 			otherTab.editor.getWrapperElement().style.display = 'none';
// 		}
// 		if (otherTab.element) {
// 			otherTab.element.classList.remove('active-tab');
// 		}
// 	});

// 	if (tab.editor) {
// 		tab.editor.getWrapperElement().style.display = 'block';
// 	} else {
// 		tab.editor = CodeMirror(document.getElementById('editorContainer'), {
// 			value: tab.content,
// 			lineNumbers: true,
// 			mode: 'markdown'
// 		});
// 	}

// 	tab.element.classList.add('active-tab');
// 	tab.editor.focus();
// }

// function addNewTab(title = 'New Document', content = '') {
// 	const newTab = new Tab(`tab${tabs.length + 1}`, title, content);
// 	tabs.push(newTab);
// 	const tabElement = createTabElement(newTab);
// 	tabsContainer.appendChild(tabElement);
// 	activateTab(newTab);
// }

// function closeTab(tab) {
// 	const index = tabs.indexOf(tab);
// 	if (index !== -1) {
// 		tabs.splice(index, 1);
// 		tab.element.remove();
// 		if (tab.editor) {
// 			tab.editor.getWrapperElement().remove();
// 		}

// 		if (tabs.length > 0) {
// 			activateTab(tabs[Math.max(index - 1, 0)]);
// 		}
// 	}
// }

// document.addEventListener('DOMContentLoaded', () => {
// 	populateTabsContainer();

// 	// Example: Add a new tab
// 	addNewTab('memos', '# Initial content for Document 1');
// 	addNewTab('research_ideas', '# Initial content for Document 2');
// });

class Tab {
	constructor(id, title, content, path) {
		this.id = id;
		this.title = title;
		this.content = content;
		this.path = path;
		this.editor = null;
		this.element = null;
	}
}

const tabsContainer = document.getElementById('editorTabs');
const editorContainer = document.getElementById('editorContainer');
const tabs = [];

function createTabElement(tab) {
	const tabElement = document.createElement('div');
	tabElement.classList.add('tab');

	// tab title
	const titleSpan = document.createElement('span');
	titleSpan.textContent = tab.title;
	tabElement.appendChild(titleSpan);

	// close button
	const closeButton = document.createElement('div');
	closeButton.textContent = '×';
	closeButton.classList.add('close');
	tabElement.appendChild(closeButton);

	closeButton.addEventListener('click', (event) => {
		event.stopPropagation();
		closeTab(tab);
	});

	tabElement.addEventListener('click', () => {
		if (!tab.element.classList.contains('active-tab')) {
			activateTab(tab);
		}
	});

	tab.element = tabElement;
	return tabElement;
}

function populateTabsContainer() {
	tabsContainer.innerHTML = '';
	tabs.forEach((tab) => {
		const tabElement = createTabElement(tab);
		tabsContainer.appendChild(tabElement);
	});
	if (tabs.length > 0) {
		activateTab(tabs[0]);
	} else {
		showNoDocumentsMessage();
	}
}

function activateTab(tab) {
	hideNoDocumentsMessage();

	tabs.forEach((otherTab) => {
		if (otherTab.editor) {
			otherTab.editor.getWrapperElement().style.display = 'none';
		}
		if (otherTab.element) {
			otherTab.element.classList.remove('active-tab');
		}
	});

	if (tab.editor) {
		tab.editor.getWrapperElement().style.display = 'block';
	} else {
		tab.editor = CodeMirror(editorContainer, {
			mode: 'markdown',
			value: tab.content,
			lineNumbers: true,
			// theme: 'dracula',
			lineWrapping: true,
		});
	}

	if (tab.path && checkIfFileHasCodes(tab.path) || !tab.path) {
		tab.editor.setOption('readOnly', true);
		tab.editor.getWrapperElement().classList.add('cm-readonly');
	} else {
		tab.editor.setOption('readOnly', false);
		tab.editor.getWrapperElement().classList.remove('cm-readonly');
	}

	tab.element.classList.add('active-tab');
	tab.editor.focus();

	updateUI();
}

async function addNewTab(title = 'New Document', content = '', filePath = '') {
	const existingTab = tabs.find((tab) => tab.path === filePath);
	if (existingTab) {
		activateTab(existingTab);
		return;
	}

	const newTab = new Tab(`tab${tabs.length + 1}`, title, content, filePath);
	tabs.push(newTab);

	const tabElement = createTabElement(newTab);
	tabsContainer.appendChild(tabElement);

	tabsContainer.scrollTo({
		left: tabsContainer.scrollWidth + 20,
		behavior: 'smooth'
	});

	activateTab(newTab);
}

function closeTab(tab) {
	const index = tabs.indexOf(tab);

	saveTabContentsToFile(tab);

	if (index !== -1) {
		tabs.splice(index, 1);
		tab.element.remove();
		if (tab.editor) {
			tab.editor.getWrapperElement().remove();
		}

		if (tabs.length > 0) {
			activateTab(tabs[Math.max(index - 1, 0)]);
		} else {
			showNoDocumentsMessage();
		}
	}
}

function closeTabWithoutSave(tab) {
	const index = tabs.indexOf(tab);

	if (index !== -1) {
		tabs.splice(index, 1);
		tab.element.remove();
		if (tab.editor) {
			tab.editor.getWrapperElement().remove();
		}

		if (tabs.length > 0) {
			activateTab(tabs[Math.max(index - 1, 0)]);
		} else {
			showNoDocumentsMessage();
		}
	}
}

// ADD FUNCIONALITY TO SAVE TAB CONTENTS TO FILE
function closeAllTabs() {
	if (tabs.length) {
		tabs.forEach((tab) => {
			if (tab.editor) {
				tab.editor.getWrapperElement().remove();
			}
			tab.element.remove();
		});
		tabs.length = 0;
		showNoDocumentsMessage();
	}
}

function saveTabContentsToFile(tab) {
	if (!tab) {
		return;
	}

	if (tab.path) {
		tab.content = tab.editor.getValue();

		window.api.send('save-file', {
			filePath: tab.path,
			content: tab.content,
		});
	}
}

function saveAllTabs() {
	tabs.forEach((tab) => {
		if (tab.path) {
			saveTabContentsToFile(tab);
		}
	});
}

function autosaveTabContentsToFile() {
	saveAllTabs();
}

setInterval(autosaveTabContentsToFile, 30000);

function checkIfFileHasCodes(filePath) {
	const fileHasCodes = codesJSON.codes.some((code) => {
		return code.codedExcerpts.some((excerpt) => excerpt.filePath === filePath);
	});

	return fileHasCodes;
}

function showNoDocumentsMessage() {
	const message = document.createElement('div');
	message.id = 'noDocumentsMessage';
	message.textContent = 'Aucun document n\'est actuellement ouvert.';
	editorContainer.appendChild(message);

	disableTabDependantButtons();
}

function hideNoDocumentsMessage() {
	const message = document.getElementById('noDocumentsMessage');
	if (message) {
		message.remove();
	}

	enableTabDependantButtons();
}

document.addEventListener('DOMContentLoaded', () => {
	populateTabsContainer();
	addNewTab(
		'Bienvenue!',
		'# Bienvenue dans QADDOE!\n\nPour commencer, fermez cet onglet puis ouvrez un document ou créez de nouveaux fichiers. Vous pouvez également importer un fichier existant.\n\nVotre travail sera enregistré automatiquement, chaque 30 secondes. Cependant, vous pouvez toujours sauveguarder manuellement en cliquant le bouton de sauvegarde en haut.\n\nPour fermer un onglet, cliquez sur le bouton \'×\' dans l\'onglet correspondant. Afin d\'éviter les pertes de données, les changements apportés au fichier seront enregistrés en même temps.\n\nPour coder un extrait de texte, selectionnez-le puis cliquez sur le bouton \'coder cet extrait\'. Vouz verrez à droite une liste de tous vos codes, ainsi que des options pour les renommer et les supprimer.\n\n## ATTENTION!\nEn raison d\'un bogue dans le gestionnaire de codage, les documents ne peuvent **pas** être modifiés après le début du codage. Ce problème sera reglé dans les versions qui suivent.\n\nPour les fichiers Word et PDF, ce logiciel prend en charge seulement le texte ce qui exclut les configurations automatiques (exemple: numérotation, table des matières, hyperliens, etc.) et les images.\nLes tableaux quant à eux sont réorganisés automatiquement de façon textuelle.\n\nPour plus d\'informations, consultez la documentation en ligne. (lien à venir)\n\nMerci d\'utiliser QADDOE!'
	);

	disableTabDependantButtons();
});
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
	constructor(id, title, content) {
		this.id = id;
		this.title = title;
		this.content = content;
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
		activateTab(tab);
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
			value: tab.content,
			lineNumbers: true,
			mode: 'markdown'
		});
	}

	tab.element.classList.add('active-tab');
	tab.editor.focus();
}

function addNewTab(title = 'New Document', content = '') {
	const newTab = new Tab(`tab${tabs.length + 1}`, title, content);
	tabs.push(newTab);
	const tabElement = createTabElement(newTab);
	tabsContainer.appendChild(tabElement);
	activateTab(newTab);
}

function closeTab(tab) {
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

function showNoDocumentsMessage() {
	const message = document.createElement('div');
	message.id = 'noDocumentsMessage';
	message.textContent = 'Aucun document n\'est actuellement ouvert.';
	editorContainer.appendChild(message);
}

function hideNoDocumentsMessage() {
	const message = document.getElementById('noDocumentsMessage');
	if (message) {
		message.remove();
	}
}

document.addEventListener('DOMContentLoaded', () => {
	populateTabsContainer();

	// Example: Add a new tab
	/* addNewTab('memos', '# Initial content for Document 1');
	addNewTab('research_ideas', '# Initial content for Document 2'); */
});
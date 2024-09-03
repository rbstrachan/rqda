function generateFileTreeHTML(tree, isRoot = false) {
	if (!tree || !tree.name) return '';

	// create a list item for the current directory or file
	const listItem = document.createElement('li');

	const span = document.createElement('span');
	span.textContent = tree.name;

	listItem.appendChild(span);

	// if directory, handle its children
	if (tree.children !== undefined) {
		listItem.classList.add('directory'); // Add a class for directories

		// make sure the root folder of the project is expanded by default
		if (isRoot) {
			listItem.classList.add('rootFolder', 'expanded'); // mark as the root folder 
		}

		const subList = document.createElement('ul');
		tree.children.forEach(child => {
			const childItem = generateFileTreeHTML(child);
			if (childItem) subList.appendChild(childItem);
		});

		listItem.appendChild(subList);
	} else {
		listItem.classList.add('file'); // Add a class for files
		listItem.dataset.path = tree.path; // Store the file path as a data attribute
	}

	return listItem;
}

// append the generated tree to a given container element
function renderFileTree(container, tree) {
	const ul = document.createElement('ul');
	const treeHTML = generateFileTreeHTML(tree, true);
	ul.appendChild(treeHTML);
	container.appendChild(ul);
}

// sort the directory tree by name, putting folders first
function sortDirectoryTree(tree) {
	if (!tree || !tree.children) return;

	tree.children.sort((a, b) => {
		if (a.children && !b.children) return -1;
		if (!a.children && b.children) return 1;
		return a.name.localeCompare(b.name);
	});

	tree.children.forEach(sortDirectoryTree);
}

function clearDirectoryTree() {
	const fileTreeContainer = document.getElementById('fileTree');
	fileTreeContainer.innerHTML = '';
}

// event listener for clicks on the file tree to expand/collapse directories
document.addEventListener('DOMContentLoaded', function () {
	const fileTreeContainer = document.getElementById('fileTree');

	// handle click events on the file tree
	fileTreeContainer.addEventListener('click', function (event) {
		const target = event.target;

		// check if the clicked element is a span inside a directory li
		if (target.tagName === 'SPAN' && target.parentElement.classList.contains('directory')) {
			const parentLi = target.parentElement;

			// toggle the 'expanded' class to show/hide the children
			parentLi.classList.toggle('expanded');
		}

		// check if the clicked element is a file
		if (target.tagName === 'SPAN' && target.parentElement.classList.contains('file')) {
			const fileName = target.textContent;
			const filePath = target.parentElement.dataset.path;

			// open the file in a new tab in the editor
			window.api.send('read-file', filePath);
		}
	});
});

function getExpandedFolders() {
	const expandedFolders = [];
	const folderElements = document.querySelectorAll('.directory.expanded');
	folderElements.forEach(folder => {
		const path = folder.querySelector('span').textContent;
		expandedFolders.push(path);
	});
	return expandedFolders;
}

function regenerateFileTree() {
	clearDirectoryTree();
	openProjectInFileTree(currentProjectDirectoy);
}

function restoreExpandedFolders(expandedFolders) {
	const folders = document.querySelectorAll('.directory');
	console.log(folders);
	expandedFolders.forEach(path => {
		folders.forEach(folderName => {
			if (folderName.textContent === path) {
				folderName.parentElement.classList.add('expanded');
			}
		});
	});
}

function updateFileTree() {
	const expandedFolders = getExpandedFolders();
	regenerateFileTree();
	restoreExpandedFolders(expandedFolders);
}

window.api.receive('file-content', (fileName, content, filePath) => {
	addNewTab(fileName, content, filePath);
});

// *** KAYQUE'S CODE ***

// function generateFileTreeHTML(tree, isRoot = false) {
// 	if (!tree || !tree.name) return "";

// 	// create a list item for the current directory or file
// 	const listItem = document.createElement("li");

// 	const span = document.createElement("span");
// 	span.textContent = tree.name;

// 	listItem.appendChild(span);

// 	// if directory, handle its children
// 	if (tree.children && tree.children.length > 0) {
// 		listItem.classList.add("directory"); // Add a class for directories

// 		// make sure the root folder of the project is expanded by default
// 		if (isRoot) {
// 			listItem.classList.add("rootFolder", "expanded"); // mark as the root folder
// 		}

// 		const subList = document.createElement("ul");
// 		tree.children.forEach((child) => {
// 			const childItem = generateFileTreeHTML(child);
// 			if (childItem) subList.appendChild(childItem);
// 		});

// 		listItem.appendChild(subList);
// 	} else {
// 		listItem.classList.add("file"); // Add a class for files
// 		listItem.dataset.path = tree.path; // Store the file path as a data attribute
// 	}

// 	return listItem;
// }

// // append the generated tree to a given container element
// function renderFileTree(container, tree) {
// 	const treeHTML = generateFileTreeHTML(tree, true);
// 	container.appendChild(treeHTML);
// }

// // sort the directory tree by name, putting folders first
// function sortDirectoryTree(tree) {
// 	if (!tree || !tree.children) return;

// 	tree.children.sort((a, b) => {
// 		if (a.children && !b.children) return -1;
// 		if (!a.children && b.children) return 1;
// 		return a.name.localeCompare(b.name);
// 	});

// 	tree.children.forEach(sortDirectoryTree);
// }

// function clearDirectoryTree() {
// 	const fileTreeContainer = document.getElementById("fileTree");
// 	fileTreeContainer.innerHTML = "";
// }

// // event listener for clicks on the file tree to expand/collapse directories
// document.addEventListener("DOMContentLoaded", function () {
// 	const fileTreeContainer = document.getElementById("fileTree");

// 	// handle click events on the file tree
// 	fileTreeContainer.addEventListener("click", function (event) {
// 		const target = event.target;

// 		// check if the clicked element is a span inside a directory li
// 		if (
// 			target.tagName === "SPAN" &&
// 			target.parentElement.classList.contains("directory")
// 		) {
// 			const parentLi = target.parentElement;

// 			// toggle the 'expanded' class to show/hide the children
// 			parentLi.classList.toggle("expanded");
// 		}

// 		// check if the clicked element is a file
// 		if (
// 			target.tagName === "SPAN" &&
// 			target.parentElement.classList.contains("file")
// 		) {
// 			const fileName = target.textContent;
// 			const filePath = target.parentElement.dataset.path;

// 			// open the file in a new tab in the editor
// 			window.api.send("read-file", filePath);
// 		}
// 	});
// });

// sortDirectoryTree(tree);
// renderFileTree(document.getElementById("fileTree"), tree);

// document.querySelectorAll("li.file").forEach((fileElement) => {
// 	let depth = 0;
// 	let parentElement = fileElement.parentElement;

// 	// Count the number of parent `ul` elements
// 	while (parentElement && parentElement.tagName === "UL") {
// 		depth++;
// 		parentElement = parentElement.parentElement.closest("ul");
// 	}

// 	// Calculate the left offset based on the depth
// 	const leftOffset = `${20 + depth * 20}px`; // Multiply depth by 40px
// 	const leftBeforeOffset = `${depth * 20}px`;

// 	// Set the CSS variable
// 	fileElement.style.setProperty("--left-offset", leftOffset);
// 	fileElement.style.setProperty("--left-before-offset", leftBeforeOffset);
// });

// document.querySelectorAll("li.directory").forEach((fileElement) => {
// 	let depth = 0;
// 	let parentElement = fileElement.parentElement;

// 	// Count the number of parent `ul` elements
// 	while (parentElement && parentElement.tagName === "UL") {
// 		depth++;
// 		parentElement = parentElement.parentElement.closest("ul");
// 	}

// 	// Calculate the left offset based on the depth
// 	const initialPaddingLeft = 20;
// 	const leftOffset = `${initialPaddingLeft + depth * 20.5}px`; // Multiply depth by 40px
// 	const leftBeforeOffset = `${depth * 20}px`;

// 	// Set the CSS variable
// 	fileElement.style.setProperty("--left-offset", leftOffset);
// 	fileElement.style.setProperty("--left-before-offset", leftBeforeOffset);
// });

// window.api.receive("file-content", (fileName, content) => {
// 	addNewTab(fileName, content);
// });

// ***
// ***
// ***

// *** IDEA FROM DISCORD SERVER ***
/* <ul class="filetree">
	<li class="filetree__item">File 1</li>
	<li class="filetree__item filetree__item--folder-container" style="--tree-depth: 1">
		<span class="filetree__item filetree__item--folder">Folder A</span>
		<ul class="filetree__folder">
			<li class="filetree__item">File 2</li>
			<li class="filetree__item">File 3</li>
			<li class="filetree__item filetree__item--folder-container" style="--tree-depth: 2">
				<span class="filetree__item filetree__item--folder">Folder B</span>
				<ul class="filetree__folder">
					<li class="filetree__item">File 4</li>
					<li class="filetree__item">File 5</li>
					<li class="filetree__item filetree__item--folder-container" style="--tree-depth: 3">
						<span class="filetree__item filetree__item--folder">Folder C</span>
						<ul class="filetree__folder">
							<li class="filetree__item">File 6</li>
							<li class="filetree__item">File 7</li>
						</ul>
					</li>
				</ul>
			</li>
		</ul>
	</li>
	<li class="filetree__item">File 8</li>
	<li class="filetree__item">File 9</li>
</ul>

* {
	box-sizing: border-box;
}

body {
	display: grid;
	place-items: center;
	min-height: 100vh;
}

.filetree {
	--tree-depth: 0;
    
	font-family: Arial, serif;
	border: 1px solid #efefef;
	overflow-x: auto;
	width: 20rem;
	padding-block: 0.5rem;
}

.filetree__item {
	padding-block: 0.125rem;
	padding-left: calc(10px + var(--tree-depth) * 20px);
	cursor: pointer;
}

.filetree__item.filetree__item--folder {
	display: block;
	font-weight: bold;
	width: 100%;
	padding-left: calc(10px + (var(--tree-depth) - 1) * 20px);
}

.filetree__item.filetree__item--folder-container {
	padding-left: 0;
}

.filetree__item:not(.filetree__item--folder-container):hover {
	background: #bbb;
}
*/
function generateFileTreeHTML(tree, isRoot = false) {
    if (!tree || !tree.name) return '';

    // create a list item for the current directory or file
    const listItem = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = tree.name;

    listItem.appendChild(span);

    // if directory, handle its children
    if (tree.children && tree.children.length > 0) {
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

window.api.receive('file-content', (fileName, content) => {
    addNewTab(fileName, content);
});
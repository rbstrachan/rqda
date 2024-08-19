function generateFileTreeHTML(tree) {
    if (!tree || !tree.name) return '';

    // Create a list item for the current directory or file
    const listItem = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = tree.name;

    listItem.appendChild(span);

    // If this is a directory, we need to handle its children
    if (tree.children && tree.children.length > 0) {
        listItem.classList.add('directory'); // Add a class for directories

        const subList = document.createElement('ul');
        tree.children.forEach(child => {
            const childItem = generateFileTreeHTML(child);
            if (childItem) subList.appendChild(childItem);
        });

        listItem.appendChild(subList);
    } else {
        listItem.classList.add('file'); // Add a class for files
    }

    return listItem;
}

// Function to append the generated tree to a given container element
function renderFileTree(container, tree) {
    const ul = document.createElement('ul');
    const treeHTML = generateFileTreeHTML(tree);
    ul.appendChild(treeHTML);
    container.appendChild(ul);
}

// event listener for clicks on the file tree to expand/collapse directories
document.addEventListener('DOMContentLoaded', function () {
    const fileTreeContainer = document.getElementById('fileTree');

    // Handle click events on the file tree
    fileTreeContainer.addEventListener('click', function (event) {
        const target = event.target;

        // Check if the clicked element is a span inside a directory li
        if (target.tagName === 'SPAN' && target.parentElement.classList.contains('directory')) {
            const parentLi = target.parentElement;

            // Toggle the 'expanded' class to show/hide the children
            parentLi.classList.toggle('expanded');
        }
    });
});

function clearDirectoryTree() {
    const fileTreeContainer = document.getElementById('fileTree');
    fileTreeContainer.innerHTML = '';
}
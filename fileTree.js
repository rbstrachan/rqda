// Function to extract the file name from the full path
function getFileName(filePath) {
    return filePath.split('/').pop();
}

// Function to display the files in the documents div
function displayFiles(files) {
    const fileTree = document.getElementById('fileTree');
    fileTree.innerHTML = ''; // Clear previous content

    files.forEach(file => {
        const fileElement = document.createElement('li');
        fileElement.classList.add('fileItem');
        
        const iconClass = file.isDirectory ? 'icon-folder' : 'icon-file';
        fileElement.innerHTML = `<span class="${iconClass}"></span> ${file.name}`;
        
        if (file.isDirectory) {
            // If it's a folder, fetch and display its contents
            const subFiles = window.electronAPI.getFilesInDirectory(file.path);
            const subFileTree = document.createElement('ul');
            subFiles.forEach(subFile => {
                const subFileElement = document.createElement('li');
                const subIconClass = subFile.isDirectory ? 'icon-folder' : 'icon-file';
                subFileElement.innerHTML = `<span class="${subIconClass}"></span> ${subFile.name}`;
                subFileTree.appendChild(subFileElement);
            });
            fileElement.appendChild(subFileTree);
        }

        fileTree.appendChild(fileElement);
    });
}

// Event listener for your button to open files/folders
document.getElementById('openFileButton').addEventListener('click', () => {
    window.electronAPI.openFileOrFolder(true).then(filePaths => {
        if (filePaths && filePaths.length > 0) {
            const files = window.electronAPI.getFilesInDirectory(filePaths[0]);
            displayFiles(files);
        }
    });
});

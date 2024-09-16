const contextMenu = document.getElementById('contextMenu');

editorContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const selectedText = window.getSelection().toString();
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
});

function hideContextMenu() {
    contextMenu.style.display = 'none';
}

// USE CODE BELOW TO CREATE A MENU SYSTEM SIMILAR TO THE MENUBARS
// TAKE IMPROVED PROCESSES FROM THIS IMPLEMENTATION AND IMPROVE MENUBARS

// document.addEventListener('DOMContentLoaded', () => {
//     // ... existing code ...

//     const contextMenu = document.getElementById('custom-context-menu');

//     // Handle clicks on context menu items
//     contextMenu.addEventListener('click', (event) => {
//         const action = event.target.getAttribute('data-action');
//         contextMenu.style.display = 'none'; // Hide the context menu

//         switch (action) {
//             case 'reload':
//                 // Perform reload action
//                 location.reload();
//                 break;
//             case 'copy':
//                 // Perform copy action (requires clipboard permissions)
//                 document.execCommand('copy');
//                 break;
//             case 'paste':
//                 // Perform paste action (requires clipboard permissions)
//                 document.execCommand('paste');
//                 break;
//             case 'custom-action':
//                 // Implement your custom action here
//                 console.log('Custom action selected');
//                 break;
//             default:
//                 break;
//         }
//     });
// });

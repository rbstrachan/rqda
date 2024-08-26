document.getElementById('newProjectButtonContainer').addEventListener('click', () => {
    displayProjectInputInfoScreen();
});

function displayProjectInputInfoScreen() {
    // set the title of the welcome text
    document.getElementById('welcomeTextTitle').textContent = 'Nommer votre projet';
    document.getElementById('welcomeTextBlurb1').textContent = 'Entrez le nom de votre projet puis cliquez sur créer pour commencer.';
    document.getElementById('welcomeTextBlurb2').style.display = 'none';

    // hide the project list
    document.getElementById('projectList').style.display = 'none';

    // show the project input form
    document.getElementById('newProjectNameInputContainer').style.display = 'block';

    // exchange the buttons
    document.getElementById('newProjectButton').style.display = 'none';
    document.getElementById('newProjectButtonText').style.display = 'none';
    document.getElementById('createProjectButton').style.display = 'block';
    document.getElementById('createProjectButtonText').style.display = 'block';

    // re-set the right margin on the button container to adapt to new text
    document.getElementById('newProjectButtonContainer').style.marginRight = '240px';

    // add an event listener for the input form
    document.getElementById('newProjectNameInput').addEventListener('input', (event) => {
        document.getElementById('createProjectButtonText').textContent = event.target.value ? 'Créer le projet \'' + event.target.value + '\'' : 'Créer le projet';
        document.getElementById('newProjectButtonContainer').style.marginRight = `${233 - event.target.value.length * 7.5}px`;
    });
}
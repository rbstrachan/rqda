let isNamingProject = false;
const createNewProjectButton = document.getElementById('newProjectButtonContainer');
const projectNameInput = document.getElementById('newProjectNameInput');

document.getElementById('windowButton').addEventListener('click', () => {
    projectAPI.send('request-close-project-screen');
});

function generateProjectsHTML(projects) {
    const projectsContainer = document.getElementById('projectList');

    projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('project');

        const projectMetaDiv = document.createElement('div');
        projectMetaDiv.classList.add('projectMeta');

        const projectImageDiv = document.createElement('div');
        projectImageDiv.classList.add('projectImage');
        projectImageDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DADADA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-git-2"><path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5"/><circle cx="13" cy="12" r="2"/><path d="M18 19c-2.8 0-5-2.2-5-5v8"/><circle cx="20" cy="19" r="2"/></svg>';

        const projectDetailsDiv = document.createElement('div');
        projectDetailsDiv.classList.add('projectDetails');

        const projectNameH2 = document.createElement('h2');
        projectNameH2.classList.add('projectName');
        projectNameH2.textContent = project.name;

        // const projectDirectorySpan = document.createElement('span');
        // projectDirectorySpan.classList.add('projectDirectory');
        // projectDirectorySpan.textContent = path.join(projectsDir, project);

        const projectCreationDateSpan = document.createElement('span');
        projectCreationDateSpan.classList.add('projectCreationDate');
        projectCreationDateSpan.textContent = `créé le ${new Date(project.creationDate).toLocaleDateString()}`;

        projectDetailsDiv.appendChild(projectNameH2);
        // projectDetailsDiv.appendChild(projectDirectorySpan);
        projectDetailsDiv.appendChild(projectCreationDateSpan);

        projectMetaDiv.appendChild(projectImageDiv);
        projectMetaDiv.appendChild(projectDetailsDiv);

        const openProjectButtonDiv = document.createElement('div');
        openProjectButtonDiv.classList.add('openProjectButton');
        openProjectButtonDiv.textContent = 'Ouvrir';
        openProjectButtonDiv.addEventListener('click', () => {
            projectAPI.send('request-open-project', project.path);
        });

        projectDiv.appendChild(projectMetaDiv);
        projectDiv.appendChild(openProjectButtonDiv);

        projectsContainer.appendChild(projectDiv);
    });
}

projectAPI.getListOfProjects().then(projects => {
    generateProjectsHTML(projects);
});

createNewProjectButton.addEventListener('click', () => {
    if (!isNamingProject) {
        displayProjectInputInfoScreen();
        isNamingProject = true;
    } else {
        const projectName = projectNameInput.value;
        if (projectName) {
            projectAPI.newProject(projectName);
        } else {
            alert('Veuillez entrer un nom de projet.');
        }
    }
});

projectNameInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        createNewProjectButton.click();
    }
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

    // set the icon and text on the button to adapt to the new form
    document.getElementById('newProjectButton').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#093A3B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"> <path d="M5 12h14" /> <path d="m12 5 7 7-7 7" /> </svg>';
    document.getElementById('newProjectButtonText').textContent = 'Créer le projet';

    // re-set the right margin on the button container to adapt to new text
    document.getElementById('newProjectButtonContainer').style.marginRight = '230px';

    // add an event listener for the input form
    document.getElementById('newProjectNameInput').addEventListener('input', (event) => {
        document.getElementById('newProjectButtonText').textContent = event.target.value ? 'Créer le projet \'' + event.target.value + '\'' : 'Créer le projet';
        document.getElementById('newProjectButtonContainer').style.marginRight = `${230 - event.target.value.length * 7.5}px`;
    });
}

// fonction pour récupérer une variable CSS depuis un fichier
async function getCSSVariableFromFile(filePath, variableName) {
    try {
        const response = await fetch(filePath);
        const cssText = await response.text();

        const regex = new RegExp(`--${variableName}:\\s*["']?([^;"']+)["']?;`);
        const match = cssText.match(regex);

        return match ? match[1].trim() : null;
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier CSS : ${error}`);
        return null;
    }
}

// mettre à jour le contenu du footer avec la version, le nom de l'application et l'année
(async () => {
    const appVersion = await getCSSVariableFromFile('../mainWindow/styles.css', 'applicationVersion');
    const appName = await getCSSVariableFromFile('../mainWindow/styles.css', 'applicationName');
    const currentYear = new Date().getFullYear();

    const footerTextElement = document.getElementById('footerText');
    if (footerTextElement) {
        const nameSpan = footerTextElement.querySelector('.name');
        const versionSpan = footerTextElement.querySelector('.version');
        const yearSpan = footerTextElement.querySelector('.year');

        if (nameSpan && appName) {
            nameSpan.textContent = appName;
        }

        if (versionSpan && appVersion) {
            versionSpan.textContent = `v${appVersion} (Alpha)`;
        }

        if (yearSpan) {
            yearSpan.textContent = currentYear;
        }
    }
})();
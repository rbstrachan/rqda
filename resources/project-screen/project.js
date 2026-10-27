let isNamingProject = false;
const createNewProjectButton = document.getElementById('newProjectButtonContainer');
const projectNameInput = document.getElementById('newProjectNameInput');

const APP_NAME = 'QADDOE';
const APP_VERSION = '1.71';

/** @type {Record<string, string>} */
let strings = {
  welcomeTitle: 'Bienvenue!',
  welcomeBlurb1: "Ceci est un logiciel de recherche qualitative qui vous permet de coder et d'analyser des données textuelles.",
  welcomeBlurb2: 'Créez un nouveau projet ou ouvrez un projet existant pour commencer.',
  projectNamePlaceholder: 'Nom du projet',
  createNewProject: 'Créer un nouveau projet',
  open: 'Ouvrir',
  createdOn: 'créé le {{date}}',
  nameProjectTitle: 'Nommer votre projet',
  nameProjectBlurb: 'Entrez le nom de votre projet puis cliquez sur créer pour commencer.',
  createProject: 'Créer le projet',
  createProjectNamed: "Créer le projet '{{name}}'",
  enterNameAlert: 'Veuillez entrer un nom de projet.',
};

function interpolate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : `{{${key}}}`
  );
}

function applyStaticStrings() {
  const title = document.getElementById('welcomeTextTitle');
  const blurb1 = document.getElementById('welcomeTextBlurb1');
  const blurb2 = document.getElementById('welcomeTextBlurb2');
  const createText = document.getElementById('newProjectButtonText');

  if (title) title.textContent = strings.welcomeTitle;
  if (blurb1) blurb1.textContent = strings.welcomeBlurb1;
  if (blurb2) {
    blurb2.textContent = strings.welcomeBlurb2;
    blurb2.style.display = '';
  }
  if (projectNameInput) {
    projectNameInput.placeholder = strings.projectNamePlaceholder;
  }
  if (createText && !isNamingProject) {
    createText.textContent = strings.createNewProject;
  }
  document.documentElement.lang =
    strings.welcomeTitle === 'Welcome!' ? 'en' : 'fr';
}

document.getElementById('windowButton').addEventListener('click', () => {
    projectAPI.send('request-close-project-screen');
});

function generateProjectsHTML(projects) {
    const projectsContainer = document.getElementById('projectList');
    projectsContainer.innerHTML = '';

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

        const projectCreationDateSpan = document.createElement('span');
        projectCreationDateSpan.classList.add('projectCreationDate');
        const date = new Date(project.creationDate).toLocaleDateString(
          document.documentElement.lang || undefined
        );
        projectCreationDateSpan.textContent = interpolate(strings.createdOn, { date });

        projectDetailsDiv.appendChild(projectNameH2);
        projectDetailsDiv.appendChild(projectCreationDateSpan);

        projectMetaDiv.appendChild(projectImageDiv);
        projectMetaDiv.appendChild(projectDetailsDiv);

        const openProjectButtonDiv = document.createElement('div');
        openProjectButtonDiv.classList.add('openProjectButton');
        openProjectButtonDiv.textContent = strings.open;
        openProjectButtonDiv.addEventListener('click', () => {
            projectAPI.send('request-open-project', project.path);
        });

        projectDiv.appendChild(projectMetaDiv);
        projectDiv.appendChild(openProjectButtonDiv);

        projectsContainer.appendChild(projectDiv);
    });
}

async function bootstrap() {
  try {
    if (typeof projectAPI.getChooserStrings === 'function') {
      const loaded = await projectAPI.getChooserStrings();
      if (loaded) strings = { ...strings, ...loaded };
    }
    if (typeof projectAPI.getSettings === 'function') {
      const settings = await projectAPI.getSettings();
      if (settings?.language) {
        document.documentElement.lang = settings.language;
      }
    }
  } catch (error) {
    console.error('Failed to load chooser translations', error);
  }

  applyStaticStrings();

  const projects = await projectAPI.getListOfProjects();
  generateProjectsHTML(projects);
}

void bootstrap();

createNewProjectButton.addEventListener('click', () => {
    if (!isNamingProject) {
        displayProjectInputInfoScreen();
        isNamingProject = true;
    } else {
        const projectName = projectNameInput.value;
        if (projectName) {
            projectAPI.newProject(projectName);
        } else {
            alert(strings.enterNameAlert);
        }
    }
});

projectNameInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        createNewProjectButton.click();
    }
});

function displayProjectInputInfoScreen() {
    document.getElementById('welcomeTextTitle').textContent = strings.nameProjectTitle;
    document.getElementById('welcomeTextBlurb1').textContent = strings.nameProjectBlurb;
    document.getElementById('welcomeTextBlurb2').style.display = 'none';

    document.getElementById('projectList').style.display = 'none';

    document.getElementById('newProjectNameInputContainer').style.display = 'block';

    document.getElementById('newProjectButton').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#093A3B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"> <path d="M5 12h14" /> <path d="m12 5 7 7-7 7" /> </svg>';
    document.getElementById('newProjectButtonText').textContent = strings.createProject;

    document.getElementById('newProjectButtonContainer').style.marginRight = '230px';

    document.getElementById('newProjectNameInput').addEventListener('input', (event) => {
        document.getElementById('newProjectButtonText').textContent = event.target.value
          ? interpolate(strings.createProjectNamed, { name: event.target.value })
          : strings.createProject;
        document.getElementById('newProjectButtonContainer').style.marginRight = `${230 - event.target.value.length * 7.5}px`;
    });
}

(function updateFooter() {
    const currentYear = new Date().getFullYear();
    const footerTextElement = document.getElementById('footerText');
    if (footerTextElement) {
        const nameSpan = footerTextElement.querySelector('.name');
        const versionSpan = footerTextElement.querySelector('.version');
        const yearSpan = footerTextElement.querySelector('.year');

        if (nameSpan) nameSpan.textContent = APP_NAME;
        if (versionSpan) versionSpan.textContent = `v${APP_VERSION}`;
        if (yearSpan) yearSpan.textContent = String(currentYear);
    }
})();

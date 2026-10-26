# QADDOE

QADDOE is a free, open-source desktop application for organizing qualitative research projects and coding research materials. It brings project files, a text editor and a hierarchical code list together in one workspace.

Use QADDOE to manage project files, create and organise codes and categories, apply codes while working with text and export a project codebook. The interface supports English and French, with light, dark and sepia themes.

For user guides and tutorials, visit the [QADDOE documentation](https://docs.reiwa.ca/qaddoe).

## Run from source

### Requirements

- Node.js and npm
- Git

### Setup

```bash
git clone https://github.com/rbstrachan/rqda.git
cd rqda
npm install
npm run dev
```

`npm run dev` starts the app in development mode. To stop it, close the app or press `Ctrl+C` in the terminal.

## Development

```bash
# Check main-process and renderer TypeScript
npm run typecheck

# Run the tests once
npm run test:unit -- --run

# Run tests with coverage
npm run coverage

# Build the application
npm run build
```

To package the app for a particular platform, use the matching script:

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

Packaged files are written to `dist/`.

## Documentation and support

- [QADDOE website](https://reiwa.ca/qaddoe)
- [QADDOE user documentation](https://docs.reiwa.ca/qaddoe)

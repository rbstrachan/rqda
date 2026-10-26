import "@testing-library/jest-dom";
import "./utils/window.mock";
import { render, screen } from "./utils";
import { expect, test, vi } from "vitest";
import { act } from "react";
import { ProjectStoreProvider } from "@/store/project-store";
import { AppMenubar } from "@/components/shell/app-menubar";
import i18n from "@/i18n";

const noop = (): void => {};

const menubarProps = {
  leftOpen: true,
  rightOpen: true,
  onToggleLeft: noop,
  onToggleRight: noop,
  debugMode: false,
  theme: "light" as const,
  onThemeChange: noop,
  projectTitle: null,
  actions: {
    saveAll: noop,
    saveAndClose: noop,
    openProjectFolder: noop,
    chooseProject: noop,
    newFile: noop,
    newFolder: noop,
    importFiles: noop,
    importFolder: noop,
    duplicate: noop,
    cutPaths: noop,
    copyPaths: noop,
    pastePaths: noop,
    copyPath: noop,
    rename: noop,
    save: noop,
    revealActiveFile: noop,
    closeTab: noop,
    deleteFile: noop,
    copy: noop,
    cut: noop,
    paste: noop,
    pastePlain: noop,
    selectAll: noop,
    deselect: noop,
    undo: noop,
    redo: noop,
    bold: noop,
    italic: noop,
    findFiles: noop,
    openSettings: noop,
    addCode: noop,
    addSubcode: noop,
    renameCode: noop,
    openCode: noop,
    deleteCode: noop,
    expandAllFolders: noop,
    collapseAllFolders: noop,
    contact: noop,
    reportIssue: noop,
    openAbout: noop,
    openDocs: noop,
    openTutorial: noop,
    openFaq: noop,
    openShortcuts: noop,
    openSuggest: noop,
    openReportIssueDocs: noop,
    openRequestFeature: noop,
    openSupport: noop,
    toggleDevTools: noop,
    reloadWindow: noop,
  },
};

describe("Project shell wiring", () => {
  test("menubar renders project menus", async () => {
    await act(async () => {
      await i18n.changeLanguage("fr");
      render(<AppMenubar {...menubarProps} />);
    });

    expect(screen.getByText("Projet")).toBeVisible();
    expect(screen.getByText("Fichier")).toBeVisible();
    expect(screen.getByText("Codage")).toBeVisible();
  });

  test("menubar switches to English", async () => {
    await act(async () => {
      await i18n.changeLanguage("en");
      render(<AppMenubar {...menubarProps} />);
    });

    expect(screen.getByText("Project")).toBeVisible();
    expect(screen.getByText("File")).toBeVisible();
    expect(screen.getByText("Coding")).toBeVisible();
  });

  test("project store subscribes to project opened", async () => {
    await act(async () => {
      render(
        <ProjectStoreProvider>
          <div>store-ready</div>
        </ProjectStoreProvider>
      );
    });

    expect(window.context.onProjectOpened).toHaveBeenCalled();
    expect(screen.getByText("store-ready")).toBeVisible();
    expect(vi.isMockFunction(window.context.onProjectOpened)).toBe(true);
  });
});

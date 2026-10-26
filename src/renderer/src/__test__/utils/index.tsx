export * from "@testing-library/dom";
import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { AppI18nProvider } from "@/i18n/provider";
import "@/i18n";

function Wrapper({ children }: { children: ReactNode }) {
  return <AppI18nProvider>{children}</AppI18nProvider>;
}

export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

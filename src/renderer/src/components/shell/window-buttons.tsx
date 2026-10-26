import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type WindowButtonsProps = {
  className?: string;
  /** When set, used instead of the default closeWindow IPC (e.g. save-then-quit). */
  onClose?: () => void;
};

export function WindowButtons({ className, onClose }: WindowButtonsProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    const api = window.context;
    if (!api?.onWindowFocusChange) return;
    return api.onWindowFocusChange(setFocused);
  }, []);

  const minimize = () => window.context?.minimizeWindow();
  const maximize = () => window.context?.toggleMaximizeWindow();
  const close = () => {
    if (onClose) onClose();
    else window.context?.closeWindow();
  };

  return (
    <div
      className={cn(
        "window-buttons flex items-center gap-2 pr-1 [-webkit-app-region:no-drag]",
        !focused && "window-buttons--unfocused",
        className
      )}
      role="group"
      aria-label={t("window.controlsAria")}
    >
      <button
        type="button"
        className="window-btn window-btn--max"
        aria-label={t("window.maximize")}
        title={t("window.maximize")}
        onClick={maximize}
      />
      <button
        type="button"
        className="window-btn window-btn--min"
        aria-label={t("window.minimize")}
        title={t("window.minimize")}
        onClick={minimize}
      />
      <button
        type="button"
        className="window-btn window-btn--close"
        aria-label={t("window.close")}
        title={t("window.close")}
        onClick={close}
      />
    </div>
  );
}

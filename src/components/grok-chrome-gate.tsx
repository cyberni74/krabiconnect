import { useEffect } from "react";
import { shouldHideGrokChrome } from "@/lib/grok-chrome";

const EXTENSIONS_SRC = "grok-app-builder/extensions.js";

function isGrokChromeNode(node: Node): boolean {
  if (!(node instanceof HTMLElement)) return false;
  if (node.tagName === "SCRIPT") {
    return (node.getAttribute("src") ?? "").includes(EXTENSIONS_SRC);
  }
  if (node.tagName === "IFRAME") {
    return (node.getAttribute("src") ?? "").includes("grok-app-builder");
  }
  const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text === "Remix" && (node.tagName === "A" || node.tagName === "BUTTON")) return true;
  if (text.includes("Created with Grok")) return true;
  return false;
}

function stripNode(node: Node) {
  if (!(node instanceof HTMLElement)) return;
  if (node.tagName === "SCRIPT" || node.tagName === "IFRAME") {
    node.remove();
    return;
  }
  node.style.setProperty("display", "none", "important");
  node.setAttribute("aria-hidden", "true");
}

function stripTree(root: ParentNode) {
  const scripts = root.querySelectorAll?.(`script[src*="${EXTENSIONS_SRC}"]`) ?? [];
  scripts.forEach((el) => el.remove());
  const frames = root.querySelectorAll?.('iframe[src*="grok-app-builder"]') ?? [];
  frames.forEach((el) => el.remove());
}

/**
 * Production hosts: drop the Grok/Remix widget if the platform still injects it.
 * No-ops on local preview.
 */
export function GrokChromeGate() {
  useEffect(() => {
    if (!shouldHideGrokChrome()) return;
    document.documentElement.dataset.hideGrokChrome = "true";
    stripTree(document);

    const obs = new MutationObserver((records) => {
      for (const rec of records) {
        for (const node of rec.addedNodes) {
          if (isGrokChromeNode(node)) stripNode(node);
          else if (node instanceof HTMLElement) stripTree(node);
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);
  return null;
}

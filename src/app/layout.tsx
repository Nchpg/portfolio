import type { ReactNode } from "react";
import "./globals.css";

// The localized <html>/<body> shell lives in app/[locale]/layout.tsx so that
// `lang` can be set from the (statically known) locale. This root layout only
// passes children through; the global not-found renders its own shell.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

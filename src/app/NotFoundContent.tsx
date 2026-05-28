"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "../components/icons";
import ErrorScreen from "./ErrorScreen";

const messages = {
  fr: { title: "Page introuvable", back: "Retour à l'accueil" },
  en: { title: "Page not found", back: "Back to home" },
};

export default function NotFoundContent() {
  const [locale] = useState<"en" | "fr">(() =>
    window.location.pathname.startsWith("/fr") ? "fr" : "en",
  );

  const t = messages[locale];

  return (
    <ErrorScreen
      code="404"
      label={t.title}
      action={
        <Link
          href={locale === "fr" ? "/fr" : "/"}
          className="error-screen__cta"
        >
          {t.back}
          <ChevronDownIcon size={14} style={{ transform: "rotate(-90deg)" }} />
        </Link>
      }
    />
  );
}

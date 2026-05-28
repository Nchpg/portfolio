import { inter, bebasNeue } from "./fonts";
import NotFoundContent from "./NotFoundDynamic";
import "./error.css";

// Rendered for unknown (non-locale) paths, outside app/[locale], so it must
// provide its own <html>/<body> shell.
export default function NotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.body.classList.add('page-loaded','is-not-found');`,
          }}
        />
        <NotFoundContent />
      </body>
    </html>
  );
}

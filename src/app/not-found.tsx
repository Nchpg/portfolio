import NotFoundContent from './NotFoundDynamic';
import './error.css';

export default function NotFound() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.body.classList.add('page-loaded','is-not-found');` }} />
      <NotFoundContent />
    </>
  );
}

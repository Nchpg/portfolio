'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import '../error.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-screen">
      <h2>{t('title')}</h2>
      <button onClick={() => reset()}>{t('retry')}</button>
    </div>
  );
}

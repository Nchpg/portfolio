'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ErrorScreen from '../ErrorScreen';

const messages = {
  fr: { title: 'Une erreur est survenue !', retry: 'Réessayer' },
  en: { title: 'Something went wrong!',     retry: 'Try again' },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = params?.locale === 'fr' ? 'fr' : 'en';
  const t = messages[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="500"
      label={t.title}
      action={
        <button className="error-screen__cta" onClick={() => reset()}>
          {t.retry}
        </button>
      }
    />
  );
}

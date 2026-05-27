import { setRequestLocale, getTranslations } from 'next-intl/server';
import ProjectList from '../../components/ProjectList/ProjectList';
import Home from './home';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'sections' });

  return (
    <Home projectsTitle={t('projects')} contactTitle={t('contact')}>
      <ProjectList locale={locale} />
    </Home>
  );
}

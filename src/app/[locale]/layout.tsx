import { notFound } from 'next/navigation';
import Navigation from '../../components/Navigation';

const locales = ['en', 'ko'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
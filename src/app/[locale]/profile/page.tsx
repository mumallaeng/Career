import Link from 'next/link';
import { getProfileData } from '@/lib/content';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export async function generateStaticParams() {
  return [
    { locale: 'ko' },
    { locale: 'en' }
  ];
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const profile = getProfileData(locale as 'ko' | 'en');

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Profile not found</h1>
      </div>
    );
  }

  // Check if the other language version exists
  const otherLocale = locale === 'ko' ? 'en' : 'ko';
  const otherProfile = getProfileData(otherLocale);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {otherProfile && (
          <nav className="back-nav" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <Link href={`/${otherLocale}/profile`} className="back-link">
              {locale === 'ko' ? 'View in English' : '한국어로 보기'}
            </Link>
          </nav>
        )}
        <article>
          <header className="post-header">
            <h1 className="post-title">
              {profile.frontMatter.title}
            </h1>
          </header>
          
          <div className="post-body">
            <MarkdownRenderer content={profile.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
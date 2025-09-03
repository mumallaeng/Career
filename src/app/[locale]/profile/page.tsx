import { getProfileData } from '@/lib/content';
import MarkdownRenderer from '@/components/MarkdownRenderer';

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

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
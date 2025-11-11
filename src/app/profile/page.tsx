import { getProfileData } from '@/lib/content';
import MDXRenderer from '@/components/MDXRenderer';

export default function ProfilePage() {
  const profile = getProfileData();

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
            <MDXRenderer content={profile.content} />
          </div>
        </article>
      </div>
    </div>
  );
}

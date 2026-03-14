import { getResumeData } from '@/lib/content';
import MDXRenderer from '@/components/MDXRenderer';

export default function ResumePage() {
  const resume = getResumeData();

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Resume not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="post-header">
            <h1 className="post-title">
              {resume.frontMatter.title}
            </h1>
            <p className="post-excerpt">
              {resume.frontMatter.description}
            </p>
          </header>

          <div className="post-body">
            <MDXRenderer content={resume.content} contentPath={resume.contentPath} />
          </div>
        </article>
      </div>
    </div>
  );
}

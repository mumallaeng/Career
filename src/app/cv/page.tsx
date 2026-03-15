import { getResumeData } from '@/lib/content';
import LocalizedText from '@/components/LocalizedText';
import MDXRenderer from '@/components/MDXRenderer';

export default function CvPage() {
  const resume = getResumeData();

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">CV not found</h1>
      </div>
    );
  }

  return (
    <div className="activities-container resume-page">
      <header className="career-section-header page-header resume-page-header">
        <div>
          <p className="career-section-label">CV</p>
          <LocalizedText as="h1" className="career-section-title" en="Full CV" ko="이력 전체 보기" />
        </div>
        <LocalizedText
          as="p"
          className="career-summary compact"
          en={resume.frontMatter.description_en ?? resume.frontMatter.description}
          ko={resume.frontMatter.description}
        />
      </header>

      <article className="resume-panel">
        <div className="post-body resume-body">
          <MDXRenderer content={resume.content} contentPath={resume.contentPath} />
        </div>
      </article>
    </div>
  );
}

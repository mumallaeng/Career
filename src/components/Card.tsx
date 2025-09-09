import Link from 'next/link';
import { Content } from '@/types/content';
import { formatContentDate } from '@/lib/utils/date';

interface CardProps {
  item: Content;
  index: number;
  type: 'project' | 'activity';
  locale: string;
}

export default function Card({ item, index, type, locale }: CardProps) {
  const isProject = type === 'project';
  const basePath = isProject ? 'projects' : 'activities';
  
  // Project layout: first featured, then alternating halves
  // Activity layout: first featured, then groups of three
  const getCardClass = () => {
    if (index === 0) {
      return `${type}-card featured`;
    }
    
    if (isProject) {
      return index % 2 === 1 ? `${type}-card half left` : `${type}-card half right`;
    } else {
      const position = (index - 1) % 3;
      const positions = ['left', 'center', 'right'];
      return `${type}-card third ${positions[position]}`;
    }
  };


  const TitleTag = isProject ? 'h2' : 'h3';

  return (
    <article className={getCardClass()}>
      <Link href={`/${locale}/${basePath}/${item.slug}`} className={`${type}-link`}>
        <div className={`${type}-content`}>
          <TitleTag className={`${type}-title`}>
            {item.frontMatter.title}
          </TitleTag>
          <div className={`${type}-meta`}>
            <time className={`${type}-date`}>
              {formatContentDate(item.frontMatter.date, isProject ? 'projects' : 'activities')}
            </time>
            {!isProject && item.frontMatter.categories && (
              <span className={`${type}-category`}>
                {item.frontMatter.categories[0]}
              </span>
            )}
            {isProject && item.frontMatter.role && (
              <span className={`${type}-role`}>
                {item.frontMatter.role}
              </span>
            )}
            <div className={`${type}-tags`}>
              {item.frontMatter.tags?.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
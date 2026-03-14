import Card from '@/components/Card';
import { ContentCardData } from '@/types/content';

export type ContentGridVariant = 'work' | 'featured-grid';

interface ContentGridProps {
  items: ContentCardData[];
  variant?: ContentGridVariant;
}

export default function ContentGrid({ items, variant = 'work' }: ContentGridProps) {
  return (
    <div className={`activities-grid ${variant === 'featured-grid' ? 'featured-grid' : ''}`.trim()}>
      {items.map((item, index) => (
        <Card key={item.slug} item={item} index={index} variant={variant} />
      ))}
    </div>
  );
}

import Card from '@/components/Card';
import { Content } from '@/types/content';

interface ContentGridProps {
  items: Content[];
}

export default function ContentGrid({ items }: ContentGridProps) {
  return (
    <div className="activities-grid">
      {items.map((item, index) => (
        <Card key={item.slug} item={item} index={index} />
      ))}
    </div>
  );
}

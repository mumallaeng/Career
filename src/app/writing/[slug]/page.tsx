import { redirect } from 'next/navigation';
import { getWritingData } from '@/lib/content';

export function generateStaticParams() {
  return getWritingData().map(item => ({ slug: item.slug }));
}

export default async function WritingDetailPage({
}: {
  params: Promise<{ slug: string }>;
}) {
  redirect('/');
}

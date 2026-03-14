import { redirect } from 'next/navigation';
import { getWorkData } from '@/lib/content';

export function generateStaticParams() {
  return getWorkData().map(item => ({ slug: item.slug }));
}

export default async function ActivitiesRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/work/${slug}`);
}

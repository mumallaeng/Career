import { redirect } from 'next/navigation';
import { generateWorkDocParams } from '@/lib/content';

export function generateStaticParams() {
  return generateWorkDocParams();
}

export default async function ActivityDocsRedirectPage({
  params,
}: {
  params: Promise<{ slug: string; docPath: string[] }>;
}) {
  const { slug, docPath } = await params;
  redirect(`/work/${slug}/docs/${docPath.join('/')}`);
}

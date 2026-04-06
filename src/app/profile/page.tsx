import StaticContentPage from '@/components/StaticContentPage';

export default function ProfilePage() {
  // Flow 2: /profile now depends on a real markdown baseline instead of fallback-only rendering.
  return <StaticContentPage slug="profile" />;
}

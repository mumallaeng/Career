export async function generateStaticParams() {
  return [
    { locale: 'ko' },
    { locale: 'en' }
  ];
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-4xl font-bold">
          {locale === 'ko' ? '안녕하세요!' : 'Hello!'}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          {locale === 'ko' ? '포트폴리오에 오신 것을 환영합니다.' : 'Welcome to my portfolio.'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {locale === 'ko' ? '프로젝트' : 'Projects'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {locale === 'ko' ? '최신 작업과 프로젝트를 확인하세요' : 'Check out my latest work and projects'}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {locale === 'ko' ? '소개' : 'Profile'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {locale === 'ko' ? '배경과 기술에 대해 자세히 알아보세요' : 'Learn more about my background and skills'}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {locale === 'ko' ? '활동' : 'Activities'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {locale === 'ko' ? '활동과 관심사를 발견해보세요' : 'Discover my activities and interests'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
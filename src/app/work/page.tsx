import WorkFilter from '@/components/WorkFilter';
import { getWorkData, toContentCardData } from '@/lib/content';

export default function WorkPage() {
  const items = getWorkData().map(toContentCardData);

  return (
    <div className="activities-container">
      <header className="career-section-header page-header">
        <div>
          <p className="career-section-label">Work</p>
          <h1 className="career-section-title">프로젝트와 케이스 스터디</h1>
        </div>
        <p className="career-summary compact">
          프로젝트의 맥락, 구현 범위, 결과를 빠르게 훑어볼 수 있게 정리했습니다.
        </p>
      </header>

      <WorkFilter items={items} />
    </div>
  );
}

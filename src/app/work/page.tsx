import WorkFilter from '@/components/WorkFilter';
import { getWorkData } from '@/lib/content';

export default function WorkPage() {
  const items = getWorkData();

  return (
    <div className="activities-container">
      <header className="career-section-header page-header">
        <div>
          <p className="career-section-label">Work</p>
          <h1 className="career-section-title">프로젝트와 케이스 스터디</h1>
        </div>
        <p className="career-summary compact">
          공개 가능한 작업 기록만 남기고, 원본 자료와 provenance는 Vault에 연결합니다.
        </p>
      </header>

      <WorkFilter items={items} />
    </div>
  );
}

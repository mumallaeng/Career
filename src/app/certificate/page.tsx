import CertificateGrid from '@/components/CertificateGrid';
import LocalizedText from '@/components/LocalizedText';
import Link from 'next/link';

export default function CertificatePage() {
  return (
    <div className="activities-container">
      <header className="career-section-header page-header">
        <div>
          <p className="career-section-label">Certificate</p>
          <LocalizedText as="h1" className="career-section-title" en="Certificates, Completions, and Awards" ko="자격증, 수료증, 상장" />
        </div>
        <LocalizedText
          as="p"
          className="career-summary compact"
          en="A working archive of qualifications, training records, and selected recognitions."
          ko="자격, 교육 이수 기록, 그리고 주요 수상 내역을 모아 둔 섹션입니다."
        />
      </header>

      <nav className="certificate-page-nav" aria-label="Certificate sections">
        <Link href="#certificates" className="certificate-page-link"><LocalizedText en="Certificates" ko="자격증" /></Link>
        <Link href="#completions" className="certificate-page-link"><LocalizedText en="Completions" ko="수료증" /></Link>
        <Link href="#awards" className="certificate-page-link"><LocalizedText en="Awards" ko="상장" /></Link>
      </nav>

      <section className="certificate-panel">
        <CertificateGrid />
      </section>
    </div>
  );
}

import { contactEmail, contactPhone, contactGithubUrl } from '@/data/contact';

export default function Contact() {
  return (
    <section id="contact" className="portfolio-section portfolio-section--secondary">
      <div className="portfolio-container">
        <header className="portfolio-section-header">
          <p className="portfolio-section-kicker">Contact</p>
          <h2 className="portfolio-section-title">Get in Touch</h2>
        </header>

        <p className="portfolio-about-summary">
          새로운 프로젝트나 협업 제안은 아래 채널로 편하게 연락 주세요.
        </p>

        <div className="portfolio-contact-links">
          <a href={`mailto:${contactEmail}`} className="portfolio-contact-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 6.25A2.75 2.75 0 0 1 5.25 3.5h13.5A2.75 2.75 0 0 1 21.5 6.25v11.5A2.75 2.75 0 0 1 18.75 20.5H5.25A2.75 2.75 0 0 1 2.5 17.75z" />
              <path d="M4 6.5l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {contactEmail}
          </a>
          <a href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} className="portfolio-contact-link">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
            </svg>
            {contactPhone}
          </a>
          <a
            href={contactGithubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-contact-link"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

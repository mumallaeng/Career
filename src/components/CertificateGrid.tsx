/* eslint-disable @next/next/no-img-element */
import LocalizedText from '@/components/LocalizedText';
import { getOneDriveAssetUrl, onedriveAssets, type OneDriveAssetDefinition } from '@/data/onedrive-assets';

type CertificateSectionConfig = {
  slug: string;
  label: string;
  description: string;
  types: ReadonlySet<string>;
};

type CertificateSectionData = CertificateSectionConfig & {
  assets: OneDriveAssetDefinition[];
};

const certificateSections: CertificateSectionConfig[] = [
  {
    slug: 'certificates',
    label: 'Certificates',
    description: 'Professional qualifications, licenses, and technical certifications.',
    types: new Set(['자격증']),
  },
  {
    slug: 'completions',
    label: 'Completions',
    description: 'Training, coursework, and program completion records.',
    types: new Set(['수료증']),
  },
  {
    slug: 'awards',
    label: 'Awards',
    description: 'Selected awards, prizes, and formal recognitions.',
    types: new Set(['award']),
  },
];

function isImageAsset(filename: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(filename);
}

function normalizeAssetType(value?: string): string {
  return (value ?? '').trim();
}

function buildSections(): CertificateSectionData[] {
  return certificateSections.map(section => ({
    ...section,
    assets: onedriveAssets
      .filter(asset => isImageAsset(asset.filename))
      .filter(asset => section.types.has(normalizeAssetType(asset.type)))
      .sort((a, b) => {
        const dateCompare = (b.startDate ?? '').localeCompare(a.startDate ?? '');
        if (dateCompare !== 0) return dateCompare;
        return a.filename.localeCompare(b.filename);
      }),
  }));
}

function formatIssueDate(asset: OneDriveAssetDefinition): string {
  if (!asset.startDate) {
    return 'Date unavailable';
  }

  return new Date(asset.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function buildHighlights(assets: OneDriveAssetDefinition[]): string[] {
  return assets
    .slice(0, 3)
    .map(asset => asset.name ?? asset.filename);
}

export default function CertificateGrid() {
  const sections = buildSections();

  return (
    <div className="certificate-sections">
      {sections.map(section => (
        <section key={section.slug} id={section.slug} className="certificate-section">
          <div className="certificate-section-head">
            <div>
              <p className="certificate-section-kicker">{section.label}</p>
              <LocalizedText
                as="h2"
                className="certificate-section-title"
                en={`${section.assets.length} item${section.assets.length === 1 ? '' : 's'}`}
                ko={`${section.assets.length}건`}
              />
            </div>
            <LocalizedText as="p" className="certificate-section-description" en={section.description} ko={
              section.slug === 'certificates'
                ? '전문 자격, 라이선스, 기술 인증.'
                : section.slug === 'completions'
                  ? '교육 과정, 훈련, 프로그램 수료 기록.'
                  : '수상, 상훈, 공식 인정 기록.'
            } />
          </div>

          <div className="certificate-highlight-list" aria-label={`${section.label} highlights`}>
            {buildHighlights(section.assets).map(highlight => (
              <span key={`${section.slug}-${highlight}`} className="certificate-highlight-pill">
                {highlight}
              </span>
            ))}
          </div>

          <div className="image-grid image-grid--uniform">
            {section.assets.map(asset => {
              const key = Array.isArray(asset.act_id) ? asset.act_id.join('-') : asset.act_id;
              const organization = asset.description ?? '';

              return (
                <div key={`${key}-${asset.filename}`} className="image-item">
                  <img src={getOneDriveAssetUrl(asset, 'thumb')} alt={asset.name ?? asset.filename} />
                  <div className="cert-info">
                    <h3>{asset.name ?? asset.filename}</h3>
                    {organization && <p>{organization}</p>}
                    <p>{formatIssueDate(asset)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import { getOneDriveAssetUrl, onedriveAssets } from '@/data/onedrive-assets';

export default function CertificateGrid() {
  const certificates = onedriveAssets
    .filter(asset => asset.type === 'certificate')
    .sort((a, b) => {
      const dateCompare = (b.startDate ?? '').localeCompare(a.startDate ?? '');
      if (dateCompare !== 0) return dateCompare;
      return a.filename.localeCompare(b.filename);
    });

  return (
    <div className="image-grid">
      {certificates.map(cert => {
        const key = Array.isArray(cert.act_id) ? cert.act_id.join('-') : cert.act_id;
        const issueDate = cert.startDate ? new Date(cert.startDate).toLocaleDateString('ko-KR') : '발급일 미상';
        const organization = cert.description ?? '';

        return (
          <div key={`${key}-${cert.filename}`} className="image-item">
          <img src={getOneDriveAssetUrl(cert, 'thumb')} alt={cert.name} />
            <div className="cert-info">
              <h3>{cert.name}</h3>
              {organization && <p>{organization}</p>}
              <p>{issueDate}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { certificates } from '@/data/certificates';

export default function CertificateGrid() {
  return (
    <div className="image-grid">
      {certificates.map((cert) => {
        const expirationText = (!cert.expirationDate || cert.expirationDate === '없음')
          ? '만료없음'
          : cert.expirationDate;

        return (
          <div key={cert.id} className="image-item">
            <img src={cert.imageCopyPath} alt={cert.name} />
            <div className="cert-info">
              <h3>{cert.name}</h3>
              <p>{cert.organization}</p>
              <p>{cert.issueDate} ~ {expirationText}</p>
              <p>{cert.type}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

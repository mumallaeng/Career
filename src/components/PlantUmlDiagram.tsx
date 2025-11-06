import { buildPlantUmlUrl } from '@/lib/plantuml';

interface PlantUmlDiagramProps {
  content: string;
  alt?: string;
}

export default function PlantUmlDiagram({ content, alt }: PlantUmlDiagramProps) {
  const url = buildPlantUmlUrl(content);

  if (!url) {
    return (
      <pre className="plantuml-code">
        {content}
      </pre>
    );
  }

  return (
    <figure className="plantuml-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt || 'PlantUML diagram'}
        className="plantuml-diagram"
        loading="lazy"
      />
    </figure>
  );
}

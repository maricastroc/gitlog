type Props = { title: string; description?: string };

export default function PageHeader({ title, description }: Props) {
  return (
    <div className="mb-7">
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }} className="text-text mb-2">
        {title}
      </h2>
      <div className="h-px bg-line w-12 mb-3" />
      {description && <p className="text-text-dim text-sm">{description}</p>}
    </div>
  );
}

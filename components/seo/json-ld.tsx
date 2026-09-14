type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonLdValue }) {
  const payload = Array.isArray(data)
    ? { '@context': 'https://schema.org', '@graph': data.map(stripContext) }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

function stripContext(node: Record<string, unknown>) {
  const { ['@context']: _ctx, ...rest } = node;
  return rest;
}

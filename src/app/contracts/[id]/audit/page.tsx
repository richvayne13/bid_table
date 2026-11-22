import AuditClient from "./AuditClient";

export function generateStaticParams() {
  return [
    { id: "e0000000-0000-0000-0000-000000000001" },
    { id: "demo" },
    { id: "1" },
  ];
}

export default function AuditPage() {
  return <AuditClient />;
}

import CompareClient from "./CompareClient";

export function generateStaticParams() {
  return [
    { id: "d0000000-0000-0000-0000-000000000001" },
    { id: "demo" },
    { id: "1" },
  ];
}

export default function ComparePage() {
  return <CompareClient />;
}

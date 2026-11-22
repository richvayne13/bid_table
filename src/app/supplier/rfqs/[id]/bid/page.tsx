import BidClient from "./BidClient";

export function generateStaticParams() {
  return [
    { id: "d0000000-0000-0000-0000-000000000001" },
    { id: "demo" },
    { id: "1" },
  ];
}

export default function BidPage() {
  return <BidClient />;
}

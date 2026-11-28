import type { Metadata } from "next";
import { PilotCompareWorkspace } from "@/components/pilot/PilotCompareWorkspace";

export const metadata: Metadata = {
  title: "시범 사이트 (Pilot) | 셀프바이어 견적 비교 테이블",
  description:
    "메인 사이트와 분리된 시범 환경에서 GitHub 공식 3종 SKILL.md를 적용한 식자재 견적 비교 테이블입니다.",
};

export default function PilotPage() {
  return <PilotCompareWorkspace />;
}

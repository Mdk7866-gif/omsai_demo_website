import Image from "next/image";

export function CompanyLogo({ className = "" }: { className?: string }) {
  return <Image className={`company-report-logo ${className}`} src="/om-logo.svg" alt="Omsai company logo" width={64} height={64} />;
}

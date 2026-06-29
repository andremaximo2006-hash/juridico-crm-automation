import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function IALayout({ children }: LayoutProps) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}

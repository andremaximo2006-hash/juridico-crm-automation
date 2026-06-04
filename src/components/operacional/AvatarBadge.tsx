import { AVATARES, RESPONSAVEL_NOMES } from "@/types/operacional";
import type { Responsavel } from "@/types/operacional";

interface AvatarBadgeProps {
  responsavel: Responsavel;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export function AvatarBadge({ responsavel, size = "md" }: AvatarBadgeProps) {
  const avatar = AVATARES[responsavel];
  const fullName = RESPONSAVEL_NOMES[responsavel];

  return (
    <div
      title={fullName}
      className={`${SIZE_MAP[size]} rounded-full flex items-center justify-center font-semibold text-white cursor-help`}
      style={{ backgroundColor: avatar.cor }}
    >
      {avatar.iniciais}
    </div>
  );
}

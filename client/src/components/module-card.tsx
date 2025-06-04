import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  status: string;
  mainValue: string;
  description: string;
  onClick: () => void;
}

export function ModuleCard({
  title,
  subtitle,
  icon: Icon,
  color,
  status,
  mainValue,
  description,
  onClick,
}: ModuleCardProps) {
  return (
    <Card
      className={cn(
        "p-6 text-white hover:shadow-lg transition-all cursor-pointer transform hover:scale-[1.02]",
        color
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0">
          {status}
        </Badge>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-80 mb-4">{subtitle}</p>
      <div className="text-2xl font-bold mb-1">{mainValue}</div>
      <p className="text-xs opacity-60">{description}</p>
    </Card>
  );
}

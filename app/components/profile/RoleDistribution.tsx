import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { roles as ROLES } from "@/lib/roles";

interface RoleDistributionProps {
  roles: Array<{ role: string; points: number }>;
  totalPoints: number;
}

export function RoleDistribution({ roles, totalPoints }: RoleDistributionProps) {
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div key={role.role} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src={ROLES[role.role as keyof typeof ROLES]} 
              alt={role.role}
              width={8}
              height={8}
            />
            <span className="font-medium">{role.role}</span>
          </div>
          <div className="flex items-center gap-3">
            <Progress 
              value={(role.points / totalPoints) * 100} 
              className="w-32 h-2"
            />
            <span className="text-sm font-semibold w-6 text-right">{role.points}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
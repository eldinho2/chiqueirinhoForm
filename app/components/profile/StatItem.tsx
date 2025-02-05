import { type ReactNode } from 'react';

interface StatItemProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-lg bg-neutral-800">
        <div className="text-gray-200">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
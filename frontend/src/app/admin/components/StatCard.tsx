"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  gradient,
  subtitle,
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#232542] bg-gradient-to-br ${gradient} p-6 shadow-xl`}
    >
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <h3 className="text-sm font-medium text-[#8398AD]">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-[#DFDFE0]">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {subtitle && <p className="mt-1 text-xs text-[#8398AD]">{subtitle}</p>}
      </div>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5"></div>
    </div>
  );
}

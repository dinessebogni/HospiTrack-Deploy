import { ReactNode } from "react";

type StatCardProps = {
  value: string | number;
  label: string;
  icon?: ReactNode;
};

const StatCard: React.FC<StatCardProps> = ({ value, label, icon }) => {
  return (
    <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center justify-center text-center w-full">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
      {icon && <div className="mt-2">{icon}</div>}
    </div>
  );
}; 

export default StatCard;

import { Trash2, ArrowRight } from "lucide-react";

interface ForwarderItemProps {
  email: string;
  destinations: string[];
  onDelete: (email: string) => void;
}

export const ForwarderItem = ({ email, destinations, onDelete }: ForwarderItemProps) => {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-700 font-medium">{email}</span>
        <button
          onClick={() => onDelete(email)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
          title="Delete forwarder"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      {destinations && destinations.length > 0 && (
        <div className="ml-2 text-sm text-gray-500">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
            <div className="flex flex-col gap-1">
              {destinations.map((dest, idx) => (
                <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 w-fit">
                  {dest}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from "react";

interface PlaceholderPageProps {
  title: string;
  icon: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, icon, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
          + New {title.replace(/s$/, "")}
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button className="border border-gray-200 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-50">🔍</button>
        </div>
      </div>

      {/* Empty State */}
      <div className="py-20 flex flex-col items-center gap-4 text-gray-400">
        <span className="text-6xl">{icon}</span>
        <div className="text-center">
          <p className="text-base font-medium text-gray-500">{title}</p>
          <p className="text-sm mt-1">{description ?? `No ${title.toLowerCase()} found. Click "New ${title.replace(/s$/, "")}" to get started.`}</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;

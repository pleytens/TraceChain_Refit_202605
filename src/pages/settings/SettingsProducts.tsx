import React from "react";

const SettingsProducts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Products Settings</h2>
        <p className="text-sm text-gray-500">Configure product definitions, categories and metadata.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3">📦</div>
        <p className="text-gray-500 text-sm">No product settings configured yet.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
          + Add Product
        </button>
      </div>
    </div>
  );
};

export default SettingsProducts;

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaTimes, FaDownload } from "react-icons/fa";
import axios from "axios";
import { utils, writeFile } from "xlsx";

export default function LogoPage() {
  // ===== LIST =====
  const [logos, setLogos] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ===== EDIT =====
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  // ===== VIEW =====
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const logosPerPage = 5;

  // 🔄 Fetch Data
  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://31.97.228.17:4061/api/admin/getlogos");
      setLogos(res.data || []);
    } catch (error) {
      console.error("Error fetching logos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this logo?")) return;
    try {
      await axios.delete(`http://31.97.228.17:4061/api/admin/deletelogo/${id}`);
      fetchLogos();
    } catch (error) {
      console.error("Error deleting logo:", error);
      alert("Failed to delete logo");
    }
  };

  // ✏️ Edit
  const handleEdit = (logo) => {
    setEditData(logo);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://31.97.228.17:4061/api/admin/updatelogo/${editData._id}`,
        editData
      );
      setModalOpen(false);
      fetchLogos();
      alert("Logo updated successfully!");
    } catch (error) {
      console.error("Error updating logo:", error);
      alert("Failed to update logo");
    }
  };

  // 👁️ View
  const handleView = (logo) => {
    setViewData(logo);
    setViewModalOpen(true);
  };

  // 🔍 Filter logos
  const filtered = logos.filter((l) =>
    (l.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * logosPerPage;
  const indexOfFirst = indexOfLast - logosPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / logosPerPage);

  // 📤 Export
  const exportData = (type) => {
    const data = filtered.map((l, i) => ({
      SI: i + 1,
      Name: l.name,
      Category: l.logoCategoryId?.categoryName || l.logoCategoryId?.name || "N/A",
      Placeholders: l.placeholders?.map(p => p.text).join(", ") || "None",
      CreatedAt: new Date(l.createdAt).toLocaleDateString(),
      Image: l.image
    }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Logos");
    writeFile(wb, `logos.${type}`);
  };

  // Download preview image
  const downloadPreview = (previewUrl, name) => {
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `${name}_preview.png`;
    link.click();
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Logo Management</h1>
          <p className="opacity-90">Manage and organize all your logos</p>
        </div>

        {/* LIST SECTION */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              All Logos
              <span className="ml-2 text-sm text-gray-500">
                ({filtered.length} total)
              </span>
            </h2>

            <div className="flex gap-2">
              <input
                placeholder="Search logos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => exportData("csv")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
              >
                CSV
              </button>
              <button
                onClick={() => exportData("xlsx")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
              >
                Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-500">Loading logos...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <th className="p-3 text-left rounded-tl-lg">#</th>
                      <th className="p-3 text-left">Preview</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Placeholders</th>
                      <th className="p-3 text-left">Created</th>
                      <th className="p-3 text-left rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.map((logo, i) => (
                      <tr key={logo._id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3 font-medium">{i + 1 + indexOfFirst}</td>
                        <td className="p-3">
                          <img
                            src={logo.previewImage || logo.image}
                            alt={logo.name}
                            className="w-16 h-16 rounded-lg object-cover shadow-md cursor-pointer hover:scale-110 transition"
                            onClick={() => handleView(logo)}
                          />
                        </td>
                        <td className="p-3 font-semibold text-gray-800">{logo.name}</td>
                        <td className="p-3">
                          {logo.placeholders && logo.placeholders.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {logo.placeholders.map((p, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                  {p.text}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No placeholders</span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(logo.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(logo)}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition"
                              title="View Logo"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEdit(logo)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
                              title="Edit Logo"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(logo._id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                              title="Delete Logo"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {current.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No logos found</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Edit Logo</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo Name
                </label>
                <input
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  value={editData.image || ""}
                  onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                {editData.image && (
                  <img
                    src={editData.image}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-contain rounded border"
                  />
                )}
              </div>

              {editData.previewImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview Image
                  </label>
                  <img
                    src={editData.previewImage}
                    alt="Preview"
                    className="mt-1 w-32 h-32 object-contain rounded border"
                  />
                </div>
              )}

              {editData.placeholders && editData.placeholders.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placeholders
                  </label>
                  <div className="space-y-2">
                    {editData.placeholders.map((p, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded">
                        <p className="text-sm">
                          <span className="font-medium">Text:</span> {p.text}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Position:</span> x:{p.position?.x}, y:{p.position?.y}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Update Logo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModalOpen && viewData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">{viewData.name}</h3>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Original Image</h4>
                  <img
                    src={viewData.image}
                    alt="Original"
                    className="w-full max-h-64 object-contain rounded"
                  />
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Preview Image (With Text Overlay)
                  </h4>
                  <img
                    src={viewData.previewImage || viewData.image}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded"
                  />
                  {viewData.previewImage && (
                    <button
                      onClick={() => downloadPreview(viewData.previewImage, viewData.name)}
                      className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <FaDownload /> Download Preview
                    </button>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg font-semibold text-gray-800">{viewData.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-800">
                      {viewData.logoCategoryId?.categoryName || viewData.logoCategoryId?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-gray-800">
                      {new Date(viewData.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-800">
                      {new Date(viewData.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {viewData.placeholders && viewData.placeholders.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Text Overlays
                    </label>
                    <div className="space-y-3">
                      {viewData.placeholders.map((p, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Text:</span>
                              <p className="text-gray-800">{p.text}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Font Size:</span>
                              <p className="text-gray-800">{p.style?.fontSize}px</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Color:</span>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: p.style?.color }}
                                />
                                <span className="text-gray-800">{p.style?.color}</span>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Font Weight:</span>
                              <p className="text-gray-800">{p.style?.fontWeight}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Position:</span>
                              <p className="text-gray-800">
                                X: {Math.round(p.position?.x)}, Y: {Math.round(p.position?.y)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Background:</span>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: p.style?.backgroundColor }}
                                />
                                <span className="text-gray-800">
                                  {p.style?.backgroundColor === "transparent" ? "Transparent" : p.style?.backgroundColor}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEdit(viewData);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Edit Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
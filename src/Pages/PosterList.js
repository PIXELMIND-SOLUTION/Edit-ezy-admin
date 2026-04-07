import { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function PosterList() {
  const [posters, setPosters] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    categoryName: "",
    title: "",
    description: "",
    posterlang: ""
  });

  const [previewModalImage, setPreviewModalImage] = useState(null);

  // Fetch posters with pagination and search
  const fetchPosters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://31.97.206.144:4061/api/poster/getallposter`,
        {
          params: {
            page: currentPage,
            search: search || undefined,  // send search only if not empty
          }
        }
      );
      // Backend returns: { data, currentPage, totalPages, totalItems }
      setPosters(response.data.data || []);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching posters:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchPosters();
  }, [fetchPosters]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchPosters();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Delete poster
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this poster?")) return;
    axios
      .delete(`http://31.97.206.144:4061/api/poster/deleteposter/${id}`)
      .then(() => {
        fetchPosters(); // refresh current page
        alert("Poster deleted successfully!");
      })
      .catch((error) => {
        console.error("Delete error:", error);
        alert("Error deleting poster.");
      });
  };

  // Edit poster
  const handleEdit = (poster) => {
    setSelectedPoster(poster);
    setEditedData({
      name: poster.name || "",
      categoryName: poster.categoryName || "",
      title: poster.title || "",
      description: poster.description || "",
      posterlang: poster.posterlang || ""
    });
    setModalOpen(true);
  };

  const handleSaveChanges = () => {
    axios
      .put(`http://31.97.206.144:4061/api/poster/editposter/${selectedPoster._id}`, editedData)
      .then(() => {
        fetchPosters(); // refresh current page
        alert("Poster updated successfully!");
        setModalOpen(false);
        setSelectedPoster(null);
      })
      .catch((error) => {
        console.error("Error updating poster:", error);
        alert("Error updating the poster.");
      });
  };

  // Export (exports all posters matching current search – server‑side export would be better, but we keep client‑side export of current page for consistency)
  const exportData = (type) => {
    const exportPosters = posters.map((poster, i) => ({
      SI: i + 1,
      ID: poster._id,
      PosterName: poster.name || "N/A",
      Category: poster.categoryName || "N/A",
      Title: poster.title || "N/A",
      Description: poster.description || "N/A",
      PosterLang: poster.posterlang || "N/A",
      Tags: Array.isArray(poster.tags) ? poster.tags.join(", ") : "N/A",
      PosterImage: poster.posterImage?.url || "N/A",
      CreatedAt: poster.createdAt ? new Date(poster.createdAt).toLocaleString() : "N/A"
    }));
    const ws = utils.json_to_sheet(exportPosters);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Posters");
    writeFile(wb, `posters.${type}`);
  };

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Posters</h2>
        <div className="flex gap-2">
          <button onClick={() => exportData("csv")} className="bg-gray-200 px-4 py-2 rounded">CSV</button>
          <button onClick={() => exportData("xlsx")} className="bg-gray-200 px-4 py-2 rounded">Excel</button>
        </div>
      </div>

      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Search by poster name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-center py-4">Loading posters...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="p-2 border">Sl</th>
                  <th className="p-2 border">Poster Image</th>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Poster Lang</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {posters.map((poster, index) => (
                  <tr key={poster._id} className="border-b">
                    <td className="p-2 border">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="p-2 border">
                      {poster.posterImage?.url ? (
                        <img
                          src={poster.posterImage.url}
                          alt="poster"
                          className="w-12 h-12 object-cover rounded cursor-pointer"
                          onClick={() => setPreviewModalImage(poster.posterImage.url)}
                          onError={(e) => (e.target.src = "/default-image.jpg")}
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-2 border">{poster.title || "N/A"}</td>
                    <td className="p-2 border">{poster.name || "N/A"}</td>
                    <td className="p-2 border">{poster.categoryName || "N/A"}</td>
                    <td className="p-2 border">{poster.posterlang || "N/A"}</td>
                    <td className="p-2 border">
                      <div className="max-w-xs truncate" title={poster.description}>
                        {poster.description || "N/A"}
                      </div>
                    </td>
                    <td className="p-2 border flex gap-2">
                      <button
                        onClick={() => handleEdit(poster)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(poster._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Poster</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                className="w-full p-2 border rounded"
                placeholder="Name"
                value={editedData.name}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Category"
                value={editedData.categoryName}
                onChange={(e) => setEditedData({ ...editedData, categoryName: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Title"
                value={editedData.title}
                onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Poster Language"
                value={editedData.posterlang}
                onChange={(e) => setEditedData({ ...editedData, posterlang: e.target.value })}
              />
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Description"
                value={editedData.description}
                onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative">
            <button
              className="absolute -top-8 right-0 text-white bg-red-500 rounded-full p-1"
              onClick={() => setPreviewModalImage(null)}
            >
              <FaTimes size={20} />
            </button>
            <img
              src={previewModalImage}
              alt="Poster Preview"
              className="max-w-full max-h-[90vh] rounded shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
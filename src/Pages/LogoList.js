import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const LogoList = () => {
  const [logos, setLogos] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editedLogoData, setEditedLogoData] = useState({});
  const logosPerPage = 5;

  // ✅ Fetch all logos
  const fetchLogos = async () => {
    try {
      const res = await axios.get("https://posterbackend.onrender.com/api/admin/getlogos");
      setLogos(res.data); // Direct array response
    } catch (error) {
      console.error("Failed to fetch logos", error);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const filteredLogos = logos.filter((logo) =>
    logo.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastLogo = currentPage * logosPerPage;
  const indexOfFirstLogo = indexOfLastLogo - logosPerPage;
  const currentLogos = filteredLogos.slice(indexOfFirstLogo, indexOfLastLogo);
  const totalPages = Math.ceil(filteredLogos.length / logosPerPage);

  const handleEdit = (logo) => {
    setEditedLogoData(logo);
    setModalOpen(true);
  };

  // ✅ Delete API
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://posterbackend.onrender.com/api/admin/deletelogo/${id}`);
      alert("Logo deleted successfully!");
      fetchLogos(); // Refresh list
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete logo.");
    }
  };

  // ✅ Update API
  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `https://posterbackend.onrender.com/api/admin/updatelogo/${editedLogoData._id}`,
        editedLogoData
      );
      alert("Logo updated successfully!");
      setModalOpen(false);
      fetchLogos(); // Refresh list
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update logo.");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">Logo List</h2>
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by logo name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Logo Image</th>
              <th className="p-2 border">Logo Name</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLogos.map((logo, index) => (
              <tr key={logo._id} className="border-b">
                <td className="p-2 border">{index + 1 + indexOfFirstLogo}</td>
                <td className="p-2 border">
                  <img
                    src={`https://posterbackend.onrender.com${logo.image}`}
                    alt={logo.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="p-2 border">{logo.name}</td>
                <td className="p-2 border">{logo.description}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    className="bg-blue-500 text-white p-1 rounded"
                    onClick={() => handleEdit(logo)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="bg-red-500 text-white p-1 rounded"
                    onClick={() => handleDelete(logo._id)}
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
      <div className="flex justify-center mt-4 gap-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Edit Logo</h3>

            <div className="mb-4">
              <label className="block mb-2">Logo Name</label>
              <input
                type="text"
                value={editedLogoData.name}
                onChange={(e) =>
                  setEditedLogoData({
                    ...editedLogoData,
                    name: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Description</label>
              <input
                type="text"
                value={editedLogoData.description}
                onChange={(e) =>
                  setEditedLogoData({
                    ...editedLogoData,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Logo Image URL</label>
              <input
                type="text"
                value={editedLogoData.image}
                onChange={(e) =>
                  setEditedLogoData({
                    ...editedLogoData,
                    image: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoList;

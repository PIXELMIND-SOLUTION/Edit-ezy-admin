import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function PosterList() {
  const [posters, setPosters] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
  const [selectedPoster, setSelectedPoster] = useState(null); // Store the poster being edited
  const [selectedImages, setSelectedImages] = useState(null);
  const [editedPosterData, setEditedPosterData] = useState({
    name: "",
    categoryName: "",
    price: "",
    description: "",
    size: "",
    festivalDate: "",
    inStock: false,
  });

  const postersPerPage = 5;

  useEffect(() => {
    axios
      .get("https://posterbackend.onrender.com/api/poster/getallposter")
      .then((res) => {
        if (res.data) {
          setPosters(res.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching posters:", error);
      });
  }, []);

  const exportData = (type) => {
    const exportPosters = filteredPosters.map(
      ({ _id, name, categoryName, price, description, size, festivalDate, inStock }) => ({
        id: _id,
        name: name || "N/A",
        categoryName: categoryName || "N/A",
        price: price || "N/A",
        description: description || "N/A",
        size: size || "N/A",
        festivalDate: festivalDate || "N/A",
        inStock: inStock ? "In Stock" : "Out of Stock",
      })
    );
    const ws = utils.json_to_sheet(exportPosters);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Posters");
    writeFile(wb, `posters.${type}`);
  };

  // Fix to handle undefined poster name
  const filteredPosters = posters.filter((poster) => {
    return (poster.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const indexOfLastPoster = currentPage * postersPerPage;
  const indexOfFirstPoster = indexOfLastPoster - postersPerPage;
  const currentPosters = filteredPosters.slice(indexOfFirstPoster, indexOfLastPoster);
  const totalPages = Math.ceil(filteredPosters.length / postersPerPage);

  const handleEdit = (poster) => {
    setSelectedPoster(poster);
    setEditedPosterData({
      name: poster.name,
      categoryName: poster.categoryName,
      price: poster.price,
      description: poster.description,
      size: poster.size,
      festivalDate: poster.festivalDate,
      inStock: poster.inStock,
    });
    setModalOpen(true); // Open the modal
  };

  const handleSaveChanges = () => {
    // Create FormData to send images as well as other fields
    const formData = new FormData();
    formData.append("name", editedPosterData.name);
    formData.append("categoryName", editedPosterData.categoryName);
    formData.append("price", editedPosterData.price);
    formData.append("description", editedPosterData.description);
    formData.append("size", editedPosterData.size);
    formData.append("festivalDate", editedPosterData.festivalDate);
    formData.append("inStock", editedPosterData.inStock);

    // Loop through any new images if selected
    if (selectedImages) {
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });
    }

    axios
      .put(
        `https://posterbackend.onrender.com/api/poster/editposter/${selectedPoster._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then((res) => {
        alert("Poster updated successfully!");
        setPosters(posters.map((poster) => (poster._id === selectedPoster._id ? { ...poster, ...editedPosterData } : poster)));
        setModalOpen(false); // Close the modal
        setSelectedPoster(null);
      })
      .catch((error) => {
        console.error("Error updating poster:", error);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`https://posterbackend.onrender.com/api/poster/deleteposter/${id}`)
      .then((res) => {
        alert("Poster deleted successfully!");
        setPosters(posters.filter((poster) => poster._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting poster:", error);
      });
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Posters</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by poster name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => exportData("csv")}>
            CSV
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => exportData("xlsx")}>
            Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Images</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Size</th>
              <th className="p-2 border">Festival Date</th>
              <th className="p-2 border">In Stock</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentPosters.map((poster, index) => (
              <tr key={poster._id} className="border-b">
                <td className="p-2 border">{index + 1 + indexOfFirstPoster}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    {poster.images.slice(0, 3).map((image, idx) => (
                      <img
                        key={idx}
                        src={`https://posterbackend.onrender.com${image}`}  // Prepend the server URL to the image path
                        alt={`poster-image-${idx}`}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => (e.target.src = "/default-image.jpg")} // Fallback image if error occurs
                      />
                    ))}
                  </div>
                </td>
                <td className="p-2 border">{poster.name || "N/A"}</td>
                <td className="p-2 border">{poster.categoryName || "N/A"}</td>
                <td className="p-2 border">{poster.price || "N/A"}</td>
                <td className="p-2 border">{poster.description || "N/A"}</td>
                <td className="p-2 border">{poster.size || "N/A"}</td>
                <td className="p-2 border">{new Date(poster.festivalDate).toLocaleDateString()}</td>
                <td className="p-2 border">{poster.inStock ? "In Stock" : "Out of Stock"}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    className="bg-blue-500 text-white p-1 rounded"
                    onClick={() => handleEdit(poster)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="bg-red-500 text-white p-1 rounded"
                    onClick={() => handleDelete(poster._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for editing poster */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Edit Poster</h3>

            {/* Poster Edit Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={editedPosterData.name}
                  onChange={(e) => setEditedPosterData({ ...editedPosterData, name: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />
              </div>

              <div>
                <label className="block mb-2">Category</label>
                <input
                  type="text"
                  value={editedPosterData.categoryName}
                  onChange={(e) => setEditedPosterData({ ...editedPosterData, categoryName: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />
              </div>

              <div>
                <label className="block mb-2">Price</label>
                <input
                  type="text"
                  value={editedPosterData.price}
                  onChange={(e) => setEditedPosterData({ ...editedPosterData, price: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />
              </div>

              <div>
                <label className="block mb-2">Description</label>
                <textarea
                  value={editedPosterData.description}
                  onChange={(e) => setEditedPosterData({ ...editedPosterData, description: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />
              </div>

              <div>
                <label className="block mb-2">Size</label>
                <input
                  type="text"
                  value={editedPosterData.size}
                  onChange={(e) => setEditedPosterData({ ...editedPosterData, size: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />
              </div>

              <div>
                <label className="block mb-2">Festival Date</label>
                <input
                  type="date"
                  value={editedPosterData.festivalDate}
                  onChange={(e) => setEditedPosterData({ ...editedPosterData, festivalDate: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2">In Stock</label>
                <input
                  type="checkbox"
                  checked={editedPosterData.inStock}
                  onChange={(e) => setEditedPosterData({ ...editedPosterData, inStock: e.target.checked })}
                  className="mr-2"
                />
                In Stock
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

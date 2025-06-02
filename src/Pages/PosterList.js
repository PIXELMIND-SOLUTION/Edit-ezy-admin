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
      .get("http://194.164.148.244:4061/api/poster/getallposter")
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

  const [bgImage, setBgImage] = useState(null);


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
    email: poster.email,
    mobile: poster.mobile,
    title: poster.title,
    tags: poster.tags,
    textSettings: poster.textSettings,
    overlaySettings: poster.overlaySettings,
  });
  setModalOpen(true);
};

const handleSaveChanges = () => {
  const formData = new FormData();

  if (editedPosterData.name !== selectedPoster.name) formData.append("name", editedPosterData.name);
  if (editedPosterData.categoryName !== selectedPoster.categoryName) formData.append("categoryName", editedPosterData.categoryName);
  if (editedPosterData.price !== selectedPoster.price) formData.append("price", editedPosterData.price);
  if (editedPosterData.description !== selectedPoster.description) formData.append("description", editedPosterData.description);
  if (editedPosterData.size !== selectedPoster.size) formData.append("size", editedPosterData.size);
  if (editedPosterData.festivalDate !== selectedPoster.festivalDate) formData.append("festivalDate", editedPosterData.festivalDate);
  if (editedPosterData.inStock !== selectedPoster.inStock) formData.append("inStock", editedPosterData.inStock);
  if (editedPosterData.email !== selectedPoster.email) formData.append("email", editedPosterData.email);
  if (editedPosterData.mobile !== selectedPoster.mobile) formData.append("mobile", editedPosterData.mobile);
  if (editedPosterData.title !== selectedPoster.title) formData.append("title", editedPosterData.title);
  if (editedPosterData.tags !== selectedPoster.tags) formData.append("tags", editedPosterData.tags);
  if (editedPosterData.textSettings !== selectedPoster.textSettings) formData.append("textSettings", editedPosterData.textSettings);
  if (editedPosterData.overlaySettings !== selectedPoster.overlaySettings) formData.append("overlaySettings", editedPosterData.overlaySettings);

  if (bgImage) formData.append("backgroundImage", bgImage);

  if (selectedImages && selectedImages.length > 0) {
    selectedImages.forEach((image) => {
      formData.append("images", image);
    });
  }

  // Check if any data is being sent
  if (formData.entries().next().done) {
    alert("No changes made.");
    return;
  }

  axios
    .put(`http://194.164.148.244:4061/api/poster/editposter/${selectedPoster._id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      alert("Poster updated successfully!");
      setPosters(
        posters.map((poster) =>
          poster._id === selectedPoster._id ? { ...poster, ...editedPosterData } : poster
        )
      );
      setModalOpen(false);
      setSelectedPoster(null);
    })
    .catch((error) => {
      console.error("Error updating poster:", error);
      alert("Error updating the poster. Please try again.");
    });
};


  const handleDelete = (id) => {
    axios
      .delete(`http://194.164.148.244:4061/api/poster/deleteposter/${id}`)
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
        <th className="p-2 border">Bg Images</th>
        <th className="p-2 border">Title</th>
        <th className="p-2 border">Name</th>
        <th className="p-2 border">Email</th>
        <th className="p-2 border">Mobile</th>
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

          {/* Images (up to 3) */}
          <td className="p-2 border">
            <div className="flex gap-2">
              {(poster.images || []).slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`poster-image-${idx}`}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => (e.target.src = "/default-image.jpg")}
                />
              ))}
            </div>
          </td>

          {/* Background Image */}
          <td className="p-2 border">
            {poster.backgroundImage ? (
              <img
                src={poster.backgroundImage}
                alt="background"
                className="w-12 h-12 object-cover rounded"
                onError={(e) => (e.target.src = "/default-image.jpg")}
              />
            ) : (
              "N/A"
            )}
          </td>

          {/* Title */}
          <td className="p-2 border">{poster.title || "N/A"}</td>

          {/* Name */}
          <td className="p-2 border">{poster.name || "N/A"}</td>

          {/* Email */}
          <td className="p-2 border">{poster.email || "N/A"}</td>

          {/* Mobile */}
          <td className="p-2 border">{poster.mobile || "N/A"}</td>

          {/* Category */}
          <td className="p-2 border">{poster.categoryName || "N/A"}</td>

          {/* Price */}
          <td className="p-2 border">{poster.price != null ? poster.price : "N/A"}</td>

          {/* Description */}
          <td className="p-2 border">{poster.description || "N/A"}</td>

          {/* Size */}
          <td className="p-2 border">{poster.size || "N/A"}</td>

          {/* Festival Date */}
          <td className="p-2 border">
            {poster.festivalDate
              ? new Date(poster.festivalDate).toLocaleDateString()
              : "N/A"}
          </td>

          {/* In Stock */}
          <td className="p-2 border">
            {poster.inStock === true ? "In Stock" : "Out of Stock"}
          </td>

          {/* Action buttons */}
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

{modalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg w-2/3 overflow-y-auto max-h-[90vh]">
      <h3 className="text-xl font-semibold mb-4">Edit Poster</h3>
      <div className="grid grid-cols-3 gap-4">
        {/* Fields */}
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

        {/* Continue similarly with the other fields... */}

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

        {/* Continue for the rest of the fields */}

        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={editedPosterData.email}
            onChange={(e) => setEditedPosterData({ ...editedPosterData, email: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
        </div>

        <div>
          <label className="block mb-2">Mobile</label>
          <input
            type="text"
            value={editedPosterData.mobile}
            onChange={(e) => setEditedPosterData({ ...editedPosterData, mobile: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
        </div>

        <div>
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={editedPosterData.title}
            onChange={(e) => setEditedPosterData({ ...editedPosterData, title: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
        </div>

        {/* Continue similarly for tags, textSettings, etc. */}

        <div>
          <label className="block mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={editedPosterData.tags}
            onChange={(e) => setEditedPosterData({ ...editedPosterData, tags: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
        </div>

        <div>
          <label className="block mb-2">Text Settings (JSON)</label>
          <textarea
            value={editedPosterData.textSettings}
            onChange={(e) => setEditedPosterData({ ...editedPosterData, textSettings: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
        </div>

        <div>
          <label className="block mb-2">Overlay Settings (JSON)</label>
          <textarea
            value={editedPosterData.overlaySettings}
            onChange={(e) => setEditedPosterData({ ...editedPosterData, overlaySettings: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
        </div>

        <div className="col-span-3">
          <label className="block mb-2">In Stock</label>
          <input
            type="checkbox"
            checked={editedPosterData.inStock}
            onChange={(e) => setEditedPosterData({ ...editedPosterData, inStock: e.target.checked })}
            className="mr-2"
          />
          In Stock
        </div>

        <div className="col-span-3">
          <label className="block mb-2">Background Image</label>
          <input
            type="file"
            onChange={(e) => setBgImage(e.target.files[0])}
            className="w-full p-2 border rounded mb-4"
          />
        </div>

        <div className="col-span-3">
          <label className="block mb-2">Overlay Images</label>
          <input
            type="file"
            multiple
            onChange={(e) => setSelectedImages(Array.from(e.target.files))}
            className="w-full p-2 border rounded mb-4"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-4">
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

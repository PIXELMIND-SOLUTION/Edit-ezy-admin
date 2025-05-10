import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const categoriesPerPage = 5;

  useEffect(() => {
    axios
      .get("https://posterbnaobackend.onrender.com/api/category/getall-cateogry")
      .then((res) => {
        if (res.data && res.data.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const exportData = (type) => {
    const exportItems = filteredCategories.map(({ _id, categoryName, subCategoryName, image }) => ({
      ID: _id,
      Category: categoryName || "N/A",
      Subcategory: subCategoryName || "N/A",
      Image: image || "N/A",
    }));
    const ws = utils.json_to_sheet(exportItems);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Categories");
    writeFile(wb, `categories.${type}`);
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.categoryName || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.categoryName || "");
    setSubCategoryName(category.subCategoryName || "");
    setCategoryImage(category.image || "");
    setModalOpen(true);
  };

  const handleSaveChanges = () => {
    const updatedCategory = {
      ...selectedCategory,
      categoryName,
      subCategoryName,
      image: categoryImage,
    };

    axios
      .put(`https://posterbnaobackend.onrender.com/api/category/update/${selectedCategory._id}`, updatedCategory)
      .then(() => {
        setCategories(categories.map((cat) => (cat._id === selectedCategory._id ? updatedCategory : cat)));
        setModalOpen(false);
        resetModalState();
      })
      .catch((error) => {
        console.error("Error updating category:", error);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`https://posterbnaobackend.onrender.com/api/category/delete/${id}`)
      .then(() => {
        setCategories(categories.filter((cat) => cat._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
      });
  };

  const resetModalState = () => {
    setCategoryName("");
    setCategoryImage("");
    setSubCategoryName("");
    setSelectedCategory(null);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Categories</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by category name..."
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
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Subcategory</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.map((cat, index) => (
              <tr key={cat._id} className="border-b">
                <td className="p-2 border">{index + 1 + indexOfFirst}</td>
                <td className="p-2 border">
                  <img
                    src={`https://posterbnaobackend.onrender.com/uploads/${cat.image}`}
                    alt={cat.categoryName}
                    className="w-12 h-12 rounded object-cover"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/50")}
                  />

                </td>
                <td className="p-2 border">{cat.categoryName || "N/A"}</td>
                <td className="p-2 border">{cat.subCategoryName || "—"}</td>
                <td className="p-2 border">
                  {new Date(cat.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="bg-blue-500 text-white p-1 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="bg-red-500 text-white p-1 rounded"
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
            className={`px-4 py-2 rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
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
            <h3 className="text-xl font-semibold mb-4">Edit Category</h3>
            <div>
              <label className="block mb-2">Category Name</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div>
              <label className="block mb-2">Subcategory Name</label>
              <input
                type="text"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div>
              <label className="block mb-2">Category Image URL</label>
              <input
                type="text"
                value={categoryImage}
                onChange={(e) => setCategoryImage(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
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
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { utils, writeFile } from "xlsx";

export default function CategoryList() {
  // ===== CREATE =====
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== LIST =====
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ===== EDIT =====
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ===== TOAST =====
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const categoriesPerPage = 5;

  // Fetch categories
  const fetchCategories = () => {
    axios
      .get("http://31.97.206.144:4061/api/category/getall-cateogry")
      .then((res) => setCategories(res.data?.categories || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast("Please enter a category name", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post("http://31.97.206.144:4061/api/category/create-cateogry", {
        categoryName,
      });
      // Show the actual message from API response
      showToast(res.data.message || "Category created successfully!", "success");
      setCategoryName("");
      fetchCategories();
    } catch (error) {
      showToast(error.response?.data?.message || "Error creating category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await axios.delete(`http://31.97.206.144:4061/api/category/delete/${id}`);
      showToast(res.data.message || "Category deleted successfully", "success");
      fetchCategories();
    } catch (error) {
      showToast(error.response?.data?.message || "Error deleting category", "error");
    }
  };

  // EDIT
  const handleEdit = (cat) => {
    setSelectedCategory(cat);
    setCategoryName(cat.categoryName);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!categoryName.trim()) {
      showToast("Category name cannot be empty", "error");
      return;
    }
    try {
      const res = await axios.put(
        `http://31.97.206.144:4061/api/category/update/${selectedCategory._id}`,
        { categoryName }
      );
      showToast(res.data.message || "Category updated successfully", "success");
      setModalOpen(false);
      setCategoryName("");
      fetchCategories();
    } catch (error) {
      showToast(error.response?.data?.message || "Error updating category", "error");
    }
  };

  // Filter & Pagination
  const filtered = categories.filter((c) =>
    c.categoryName.toLowerCase().includes(search.toLowerCase())
  );
  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / categoriesPerPage);

  // Export
  const exportData = (type) => {
    const data = filtered.map((c, i) => ({
      SI: i + 1,
      Category: c.categoryName,
      Date: new Date(c.createdAt).toLocaleDateString(),
    }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Categories");
    writeFile(wb, `categories.${type}`);
    showToast(`Exported as ${type.toUpperCase()}`, "success");
  };

  return (
    <div className="p-4 sm:p-6 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg shadow-lg text-white transition-all duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Card */}
        <div className="bg-white p-3 rounded-xl shadow-md h-fit">
          <h4 className="text-lg font-semibold text-blue-600 mb-4">Create Category</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        {/* List Card */}
        <div className="lg:col-span-2 bg-white p-3 rounded-xl shadow-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <h4 className="text-lg font-semibold text-blue-900">All Categories</h4>
            <div className="flex gap-2 flex-wrap">
              <input
                className="p-2 border rounded-lg"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={() => exportData("csv")} className="bg-gray-200 px-3 py-1 rounded">
                CSV
              </button>
              <button onClick={() => exportData("xlsx")} className="bg-gray-200 px-3 py-1 rounded">
                Excel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Category</th>
                  <th className="p-2 hidden sm:table-cell">Date</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {current.map((cat, i) => (
                  <tr key={cat._id} className="border-b">
                    <td className="p-2">{i + 1 + indexOfFirst}</td>
                    <td className="p-2">{cat.categoryName}</td>
                    <td className="p-2 hidden sm:table-cell">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 flex justify-center gap-2">
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
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Prev
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3">Edit Category</h3>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
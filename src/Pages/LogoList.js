import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import axios from "axios";
import { utils, writeFile } from "xlsx";

export default function LogoPage() {
  // ===== CREATE =====
  const [logoName, setLogoName] = useState("");
  const [logoCategoryId, setLogoCategoryId] = useState("");
  const [logoImage, setLogoImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);

  // 🔍 Dropdown Search
  const [categorySearch, setCategorySearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const fileInputRef = useRef(null);

  // ===== LIST =====
  const [logos, setLogos] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ===== EDIT =====
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  const logosPerPage = 5;

  // 🔄 Fetch Data
  useEffect(() => {
    fetchLogos();
    fetchCategories();
  }, []);

  const fetchLogos = async () => {
    const res = await axios.get("http://31.97.206.144:4061/api/admin/getlogos");
    setLogos(res.data || []);
  };

  const fetchCategories = async () => {
    const res = await axios.get(
      "http://31.97.206.144:4061/api/admin/getlogocategories"
    );
    setCategories(res.data?.categories || []);
  };

  // 🔽 Close dropdown outside click
  useEffect(() => {
    const close = () => setShowDropdown(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // 🔍 Filter categories
  const filteredCategories = categories.filter((c) =>
    (c.categoryName || c.name || "")
      .toLowerCase()
      .includes(categorySearch.toLowerCase())
  );

  // ✅ CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoName || !logoCategoryId || !logoImage) {
      return alert("All fields required");
    }

    const formData = new FormData();
    formData.append("name", logoName);
    formData.append("logoCategoryId", logoCategoryId);
    formData.append("image", logoImage);

    await axios.post(
      "http://31.97.206.144:4061/api/admin/createlogo",
      formData
    );

    setLogoName("");
    setLogoCategoryId("");
    setLogoImage(null);
    setPreviewImage(null);
    setCategorySearch("");
    fileInputRef.current.value = "";

    fetchLogos();
  };

  // 🖼 Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this logo?")) return;
    await axios.delete(
      `http://31.97.206.144:4061/api/admin/deletelogo/${id}`
    );
    fetchLogos();
  };

  // ✏️ Edit
  const handleEdit = (logo) => {
    setEditData(logo);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    await axios.put(
      `http://31.97.206.144:4061/api/admin/updatelogo/${editData._id}`,
      editData
    );
    setModalOpen(false);
    fetchLogos();
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
      Image: l.image,
    }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Logos");
    writeFile(wb, `logos.${type}`);
  };

  return (
    <div className="p-4 sm:p-6">

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* CREATE */}
        <div className="bg-white p-3 rounded-xl shadow-md h-fit">
          <h4 className="text-lg font-semibold text-blue-600 mb-4">
            Create Logo
          </h4>

          <form onSubmit={handleSubmit} className="space-y-3">

            <input
              placeholder="Logo name"
              value={logoName}
              onChange={(e) => setLogoName(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />

            {/* 🔥 DROPDOWN + SEARCH */}
            <div className="relative w-full">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="w-full p-2 border rounded-lg bg-white cursor-pointer flex justify-between"
              >
                <span className={logoCategoryId ? "text-black" : "text-gray-400"}>
                  {categorySearch || "Select Category"}
                </span>
                <span>▼</span>
              </div>

              {showDropdown && (
                <div
                  className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full p-2 border-b outline-none"
                    autoFocus
                  />

                  <div className="max-h-40 overflow-y-auto">
                    {filteredCategories.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setLogoCategoryId(c._id);
                          setCategorySearch(c.categoryName || c.name);
                          setShowDropdown(false);
                        }}
                        className="p-2 hover:bg-blue-50 cursor-pointer"
                      >
                        {c.categoryName || c.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload */}
            {previewImage ? (
              <div className="text-center">
                <img
                  src={previewImage}
                  className="h-32 sm:h-40 mx-auto rounded object-contain"
                />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="text-red-500 mt-2"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-dashed border-2 p-4 text-center cursor-pointer rounded"
              >
                <FaCloudUploadAlt size={40} />
                <p>Upload Image</p>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded">
              Create
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 bg-white p-3 rounded-xl shadow-md">

          <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
            <h4 className="text-lg font-semibold text-blue-900">
              All Logos
            </h4>

            <div className="flex gap-2 flex-wrap">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 border rounded"
              />
              <button onClick={() => exportData("csv")} className="bg-gray-200 px-2 rounded">
                CSV
              </button>
              <button onClick={() => exportData("xlsx")} className="bg-gray-200 px-2 rounded">
                Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm border">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {current.map((l, i) => (
                  <tr key={l._id} className="border-b">
                    <td className="p-2">{i + 1 + indexOfFirst}</td>
                    <td className="p-2">
                      <img src={l.image} className="w-12 h-12 rounded mx-auto" />
                    </td>
                    <td className="p-2">{l.name}</td>
                    <td className="p-2 flex justify-center gap-2">
                      <button onClick={() => handleEdit(l)} className="bg-blue-500 text-white p-1 rounded">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(l._id)} className="bg-red-500 text-white p-1 rounded">
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
            <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} className="bg-blue-500 text-white px-3 py-1 rounded">
              Prev
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} className="bg-blue-500 text-white px-3 py-1 rounded">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-full max-w-md">

            <h3 className="text-lg mb-3">Edit Logo</h3>

            <input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full p-2 border mb-3 rounded"
            />

            <input
              value={editData.image}
              onChange={(e) => setEditData({ ...editData, image: e.target.value })}
              className="w-full p-2 border mb-3 rounded"
            />

            <div className="flex justify-between">
              <button onClick={() => setModalOpen(false)} className="bg-gray-400 px-3 py-1 text-white rounded">
                Cancel
              </button>
              <button onClick={handleUpdate} className="bg-blue-600 px-3 py-1 text-white rounded">
                Update
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
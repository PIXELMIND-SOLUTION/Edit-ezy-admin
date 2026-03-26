import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaTimes, FaDownload, FaPlus, FaSearch, FaPalette, FaFont, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaQrcode, FaImage, FaCrop, FaBorderAll } from "react-icons/fa";
import axios from "axios";
import { utils, writeFile } from "xlsx";
import { useNavigate } from "react-router-dom";

export default function BusinessCardList() {
  const navigate = useNavigate();

  // ===== LIST =====
  const [businessCards, setBusinessCards] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ===== EDIT =====
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  // ===== VIEW =====
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const itemsPerPage = 5;

  // 🔄 Fetch Data
  useEffect(() => {
    fetchBusinessCards();
  }, []);

  const fetchBusinessCards = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://31.97.206.144:4061/api/admin/getbusinesscards");
      console.log("Business cards:", res.data);
      setBusinessCards(res.data.data || res.data || []);
    } catch (error) {
      console.error("Error fetching business cards:", error);
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this business card?")) return;
    try {
      await axios.delete(`http://31.97.206.144:4061/api/admin/deletebusinesscard/${id}`);
      fetchBusinessCards();
      alert("Business card deleted successfully!");
    } catch (error) {
      console.error("Error deleting business card:", error);
      alert("Failed to delete business card");
    }
  };

  // ✏️ Edit
  const handleEdit = (card) => {
    setEditData(card);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://31.97.206.144:4061/api/admin/updatebusinesscard/${editData._id}`,
        editData
      );
      if (response.data.success) {
        setModalOpen(false);
        fetchBusinessCards();
        alert("Business card updated successfully!");
      }
    } catch (error) {
      console.error("Error updating business card:", error);
      alert("Failed to update business card");
    }
  };

  // 👁️ View
  const handleView = (card) => {
    setViewData(card);
    setViewModalOpen(true);
  };

  // 🔍 Filter cards
  const filtered = businessCards.filter((card) =>
    (card.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (card.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (card.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // 📤 Export
  const exportData = (type) => {
    const data = filtered.map((card, i) => ({
      SI: i + 1,
      Name: card.name,
      Title: card.title,
      Company: card.company || "N/A",
      Email: card.email || "N/A",
      Phone: card.phone || "N/A",
      Website: card.website || "N/A",
      Address: card.address || "N/A",
      Template: card.useTemplate ? "Yes" : "No",
      SocialLinks: card.socialLinks?.filter(s => s.url).length || 0,
      CreatedAt: new Date(card.createdAt).toLocaleDateString(),
      UpdatedAt: new Date(card.updatedAt).toLocaleDateString()
    }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "BusinessCards");
    writeFile(wb, `business_cards.${type}`);
  };

  // Download preview image
  const downloadPreview = async (previewUrl, name) => {
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}_business_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading:", error);
      alert("Failed to download image");
    }
  };

  // Render social icons preview
  const renderSocialIcons = (socialLinks) => {
    const activeLinks = socialLinks?.filter(s => s.url && s.url.trim() !== '') || [];
    if (activeLinks.length === 0) return <span className="text-gray-400">No links</span>;
    
    return (
      <div className="flex gap-1">
        {activeLinks.slice(0, 3).map((social, idx) => (
          <img 
            key={idx}
            src={social.iconUrl} 
            alt={social.iconName}
            style={{ width: '20px', height: '20px' }}
          />
        ))}
        {activeLinks.length > 3 && <span className="text-xs text-gray-500">+{activeLinks.length - 3}</span>}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Business Card Management</h1>
          <p className="opacity-90">Manage and organize all your business cards</p>
        </div>

        {/* LIST SECTION */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              All Business Cards
              <span className="ml-2 text-sm text-gray-500">
                ({filtered.length} total)
              </span>
            </h2>

            <div className="flex gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search by name, company or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
              </div>
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
              <button
                onClick={() => navigate("/create-business-card")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <FaPlus /> Create New
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-500">Loading business cards...</p>
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
                      <th className="p-3 text-left">Title</th>
                      <th className="p-3 text-left">Company</th>
                      <th className="p-3 text-left">Contact</th>
                      <th className="p-3 text-left">Social</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Created</th>
                      <th className="p-3 text-left rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.map((card, i) => (
                      <tr key={card._id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3 font-medium">{i + 1 + indexOfFirst}</td>
                        <td className="p-3">
                          <img
                            src={card.previewImage || card.image || 'https://via.placeholder.com/60x60?text=No+Image'}
                            alt={card.name}
                            className="w-16 h-16 rounded-lg object-cover shadow-md cursor-pointer hover:scale-110 transition"
                            onClick={() => handleView(card)}
                          />
                        </td>
                        <td className="p-3 font-semibold text-gray-800">{card.name}</td>
                        <td className="p-3 text-gray-600">{card.title}</td>
                        <td className="p-3 text-gray-600">{card.company || 'N/A'}</td>
                        <td className="p-3">
                          <div className="text-sm">
                            {card.email && <div className="truncate max-w-[150px]">📧 {card.email}</div>}
                            {card.phone && <div>📞 {card.phone}</div>}
                          </div>
                        </td>
                        <td className="p-3">{renderSocialIcons(card.socialLinks)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${card.useTemplate ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {card.useTemplate ? 'Template' : 'Custom'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(card.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(card)}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition"
                              title="View Card"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEdit(card)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
                              title="Edit Card"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(card._id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                              title="Delete Card"
                            >
                              <FaTrash />
                            </button>
                            {card.previewImage && (
                              <button
                                onClick={() => downloadPreview(card.previewImage, card.name)}
                                className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition"
                                title="Download"
                              >
                                <FaDownload />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {current.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No business cards found</p>
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
              <h3 className="text-xl font-bold text-gray-800">Edit Business Card</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input value={editData.title || ""} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company</label><input value={editData.company || ""} onChange={(e) => setEditData({ ...editData, company: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input value={editData.address || ""} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input value={editData.website || ""} onChange={(e) => setEditData({ ...editData, website: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
              {editData.previewImage && (<div><label className="block text-sm font-medium text-gray-700 mb-1">Preview Image</label><img src={editData.previewImage} alt="Preview" className="mt-1 w-32 h-32 object-contain rounded border" /></div>)}
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Update Card</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL - COMPLETE WITH TEMPLATE IMAGE */}
      {viewModalOpen && viewData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">{viewData.name} - Business Card Details</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Images Section - Original, Preview, Template */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Preview Image */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaImage className="text-purple-600" /> Final Preview</h4>
                  <img src={viewData.previewImage || viewData.image} alt="Preview" className="w-full max-h-48 object-contain rounded" />
                  {viewData.previewImage && (
                    <button onClick={() => downloadPreview(viewData.previewImage, viewData.name)} className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition text-sm flex items-center justify-center gap-2">
                      <FaDownload /> Download
                    </button>
                  )}
                </div>

                {/* Template Image */}
                {viewData.templateImage && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaImage className="text-blue-600" /> Template Used</h4>
                    <img src={viewData.templateImage} alt="Template" className="w-full max-h-48 object-contain rounded" />
                    <p className="text-xs text-gray-500 mt-2 text-center">Original template image</p>
                  </div>
                )}

                {/* Original Logo */}
                {viewData.logo && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaImage className="text-orange-600" /> Logo</h4>
                    <img src={viewData.logo} alt="Logo" className="w-full max-h-48 object-contain rounded" />
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><FaUser className="text-purple-600" /> Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-500">Name</label><p className="font-semibold">{viewData.name}</p></div>
                  <div><label className="text-sm text-gray-500">Title</label><p>{viewData.title}</p></div>
                  <div><label className="text-sm text-gray-500">Company</label><p>{viewData.company || 'N/A'}</p></div>
                  <div><label className="text-sm text-gray-500">Email</label><p className="flex items-center gap-1"><FaEnvelope className="text-gray-400" /> {viewData.email || 'N/A'}</p></div>
                  <div><label className="text-sm text-gray-500">Phone</label><p className="flex items-center gap-1"><FaPhone className="text-gray-400" /> {viewData.phone || 'N/A'}</p></div>
                  <div><label className="text-sm text-gray-500">Address</label><p className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400" /> {viewData.address || 'N/A'}</p></div>
                  <div><label className="text-sm text-gray-500">Website</label><p className="flex items-center gap-1"><FaGlobe className="text-gray-400" /> {viewData.website || 'N/A'}</p></div>
                  <div><label className="text-sm text-gray-500">Template Used</label><p><span className={`px-2 py-1 rounded-full text-xs ${viewData.useTemplate ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{viewData.useTemplate ? 'Yes' : 'No'}</span></p></div>
                </div>
              </div>

              {/* Design Settings */}
              {viewData.design && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><FaPalette className="text-purple-600" /> Design Settings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2"><div style={{ width: '30px', height: '30px', backgroundColor: viewData.design.backgroundColor, border: '1px solid #ddd', borderRadius: '4px' }} /><div><span className="text-xs text-gray-500">Background</span><br />{viewData.design.backgroundColor}</div></div>
                    <div className="flex items-center gap-2"><div style={{ width: '30px', height: '30px', backgroundColor: viewData.design.accentColor, border: '1px solid #ddd', borderRadius: '4px' }} /><div><span className="text-xs text-gray-500">Accent</span><br />{viewData.design.accentColor}</div></div>
                    <div><span className="text-xs text-gray-500">Font Family</span><br /><FaFont className="inline mr-1" /> {viewData.design.fontFamily}</div>
                    <div><span className="text-xs text-gray-500">Font Size</span><br />{viewData.design.fontSize}px</div>
                    <div><span className="text-xs text-gray-500">Text Color</span><br /><div style={{ width: '20px', height: '20px', backgroundColor: viewData.design.textColor, border: '1px solid #ddd', borderRadius: '4px', display: 'inline-block' }} /> {viewData.design.textColor}</div>
                    <div><span className="text-xs text-gray-500">Rounded Corners</span><br />{viewData.design.roundedCorners ? 'Yes' : 'No'}</div>
                    <div><span className="text-xs text-gray-500">Shadow</span><br />{viewData.design.shadow ? 'Yes' : 'No'}</div>
                    <div><span className="text-xs text-gray-500">Border</span><br />{viewData.design.border ? 'Yes' : 'No'}</div>
                    <div><span className="text-xs text-gray-500">Show Logo</span><br />{viewData.design.showLogo ? 'Yes' : 'No'}</div>
                    <div><span className="text-xs text-gray-500">Show QR Code</span><br />{viewData.design.showQrCode ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {/* Logo Settings */}
              {viewData.logoSettings && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><FaCrop className="text-purple-600" /> Logo Settings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><span className="text-xs text-gray-500">Position</span><br />X: {Math.round(viewData.logoSettings.x)}, Y: {Math.round(viewData.logoSettings.y)}</div>
                    <div><span className="text-xs text-gray-500">Size</span><br />{viewData.logoSettings.width} x {viewData.logoSettings.height}px</div>
                    <div><span className="text-xs text-gray-500">Shape</span><br />{viewData.logoSettings.shape}</div>
                    {viewData.logoSettings.shape === 'rounded' && <div><span className="text-xs text-gray-500">Border Radius</span><br />{viewData.logoSettings.borderRadius}px</div>}
                    {viewData.logoSettings.borderWidth > 0 && <div><span className="text-xs text-gray-500">Border</span><br />{viewData.logoSettings.borderWidth}px {viewData.logoSettings.borderColor}</div>}
                  </div>
                </div>
              )}

              {/* Text Styles */}
              {viewData.textStyles && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><FaFont className="text-purple-600" /> Text Styles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(viewData.textStyles).map(([key, style]) => (
                      <div key={key} className="border-b pb-2">
                        <span className="font-semibold capitalize">{key}:</span>
                        <div className="text-sm">Font: {style.fontSize}px, {style.fontWeight}{style.italic ? ', Italic' : ''}{style.underline ? ', Underline' : ''}</div>
                        <div className="text-sm">Color: <span style={{ backgroundColor: style.color, width: '16px', height: '16px', display: 'inline-block', borderRadius: '4px', border: '1px solid #ddd' }} /> {style.color}</div>
                        <div className="text-sm">Position: X: {Math.round(style.x)}, Y: {Math.round(style.y)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {viewData.socialLinks && viewData.socialLinks.filter(s => s.url).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><FaGlobe className="text-purple-600" /> Social Links</h4>
                  <div className="space-y-3">
                    {viewData.socialLinks.filter(s => s.url).map((social, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                        <img src={social.iconUrl} alt={social.iconName} style={{ width: '32px', height: '32px' }} />
                        <div className="flex-1"><div className="font-semibold">{social.iconName}</div><a href={social.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">{social.url}</a></div>
                        <div className="text-xs text-gray-500">Size: {social.iconSize}px</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code */}
              {viewData.qrCode && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><FaQrcode className="text-purple-600" /> QR Code</h4>
                  <img src={viewData.qrCode} alt="QR Code" className="w-24 h-24 object-contain border rounded" />
                </div>
              )}

              {/* Timestamps */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>Created: {new Date(viewData.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(viewData.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
              <button onClick={() => setViewModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Close</button>
              <button onClick={() => { setViewModalOpen(false); handleEdit(viewData); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"><FaEdit className="inline mr-1" /> Edit Card</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
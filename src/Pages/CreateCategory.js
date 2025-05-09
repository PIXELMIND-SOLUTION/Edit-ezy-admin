import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate
import axios from 'axios';
import { FaUpload } from 'react-icons/fa';

const CreateCategory = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate

  const [categoryName, setCategoryName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!categoryName || !image) {
      setErrorMessage('Category name and image are required.');
      return;
    }

    const formData = new FormData();
    formData.append('categoryName', categoryName);
    formData.append('image', image);
    if (subCategory.trim()) {
      formData.append('subCategoryName', subCategory);
    }

    try {
      await axios.post('https://posterbnaobackend.onrender.com/api/category/create-cateogry', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Category created successfully!');
      setTimeout(() => {
        navigate('/categorylist'); // ✅ Navigate after success
      }, 1000);
    } catch (err) {
      console.error('Error creating category:', err);
      setErrorMessage('Error creating category. Please try again.');
    }
  };

  return (
    <div className="container p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-6 text-center text-blue-900">Create New Category</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">Category Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Subcategory (Optional)</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            placeholder="Enter subcategory name (optional)"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="fileInput"
          />

          <label
            htmlFor="fileInput"
            className="cursor-pointer p-2 text-sm bg-blue-900 text-white rounded-md flex items-center justify-start"
          >
            <FaUpload className="mr-2 text-sm" /> Upload Image
          </label>

          {previewImage && (
            <div className="mt-3">
              <img
                src={previewImage}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-red-600 text-center">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="text-green-600 text-center">{successMessage}</p>
        )}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-900 text-white p-3 rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
          >
            Create Category
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;

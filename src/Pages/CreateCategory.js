import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload } from 'react-icons/fa';

const CreateCategory = () => {
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 🚫 Prevent double submit

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      alert('Form is already being submitted. Please wait...');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    if (!categoryName || !subCategory || !image) {
      setErrorMessage('All fields including subcategory and image are required.');
      return;
    }

    setIsSubmitting(true); // 🔒 Lock submit

    const formData = new FormData();
    formData.append('categoryName', categoryName.trim());
    formData.append('subCategoryName', subCategory.trim());
    formData.append('image', image);

    try {
      const response = await axios.post(
        'https://posterbackend.onrender.com/api/category/create-cateogry',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setSuccessMessage('Category created successfully!');
      setTimeout(() => {
        navigate('/categorylist');
      }, 1500);
    } catch (err) {
      console.error('Error creating category:', err);
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false); // 🔓 Unlock submit after response
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
          <label className="block text-lg font-medium mb-2">Subcategory</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            placeholder="Enter subcategory name"
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
            className="cursor-pointer p-2 text-sm bg-blue-900 text-white rounded-md flex items-center justify-start w-fit"
          >
            <FaUpload className="mr-2 text-sm" /> Upload Image
          </label>

          {previewImage && (
            <div className="mt-3">
              <img
                src={previewImage}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-md border"
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
            disabled={isSubmitting}
            className={`p-3 rounded-lg shadow-md transition duration-300 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;

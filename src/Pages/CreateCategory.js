import React, { useState } from 'react';
import axios from 'axios';
import { FaUpload } from 'react-icons/fa'; // Import the React icon for upload

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [subCategory, setSubCategory] = useState(''); // For subcategory input
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName || !image) {
      setErrorMessage('Category name and image are required');
      return;
    }

    const formData = new FormData();
    formData.append('categoryName', categoryName);
    formData.append('image', image);

    if (subCategory.trim()) {
      formData.append('subCategory', subCategory); // Only add subcategory if entered
    }

    try {
      const res = await axios.post('https://posterbnaobackend.onrender.com/api/category/create-cateogry', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Category created successfully!');
      setCategoryName('');
      setSubCategory(''); // Reset subcategory input
      setImage(null);
      setPreviewImage('');
      setErrorMessage('');
    } catch (err) {
      console.error('Error creating category:', err);
      setErrorMessage('Error creating category. Please try again.');
    }
  };

  return (
    <div className="container p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
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
            placeholder="Enter subcategory name (Optional)"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Category Image</label>
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="fileInput"
          />
          {/* Custom upload button using React icon */}
          <label htmlFor="fileInput" className="cursor-pointer p-2 text-sm bg-blue-900 text-white rounded-md flex items-center justify-start">
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

        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}

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

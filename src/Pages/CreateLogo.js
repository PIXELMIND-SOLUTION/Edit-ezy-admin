import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateLogo = () => {
  const [logoName, setLogoName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [logoImage, setLogoImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // ✅ New loading state

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoName || !description || !price || !logoImage) {
      setErrorMessage('All fields are required.');
      return;
    }

    setLoading(true); // ✅ Start loading
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('name', logoName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('image', logoImage);

    try {
      await axios.post(
        'http://194.164.148.244:4061/api/admin/createlogo',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setSuccessMessage('Logo created successfully!');
      setLogoName('');
      setDescription('');
      setPrice('');
      setLogoImage(null);
      setPreviewImage(null);

      setTimeout(() => {
        navigate('/logolist');
      }, 1500);
    } catch (error) {
      setErrorMessage('Error creating logo. Please try again.');
      console.error(error);
    } finally {
      setLoading(false); // ✅ End loading
    }
  };

  return (
    <div className="container p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center text-blue-900">Create Logo</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">Logo Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            value={logoName}
            onChange={(e) => setLogoName(e.target.value)}
            placeholder="Enter logo name"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Description</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter logo description"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Price</label>
          <input
            type="number"
            className="w-full p-3 border rounded-lg"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter logo price"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Logo Image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-3 border rounded-lg"
            onChange={handleImageChange}
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-4 w-32 h-32 object-cover rounded-lg"
            />
          )}
        </div>

        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
        {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}

        <div className="text-center">
          <button
            type="submit"
            disabled={loading} // ✅ Disable when loading
            className={`px-6 py-3 rounded-lg transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            {loading ? 'Creating...' : 'Create Logo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLogo;

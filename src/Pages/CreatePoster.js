import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePoster = () => {
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [price, setPrice] = useState('');
  const [bgImage, setBgImage] = useState(null);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [festivalDate, setFestivalDate] = useState('');
  const [size, setSize] = useState('');
  const [inStock, setInStock] = useState(false);
  const [tags, setTags] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [title, setTitle] = useState('');
  const [textSettings, setTextSettings] = useState('{}');
  const [overlaySettings, setOverlaySettings] = useState('{}');
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://194.164.148.244:4061/api/category/getall-cateogry')
      .then((response) => {
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    setBgImage(file);
  };

  const handleOverlayImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...previews]);
    setImageFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Basic validation for required fields
    if (!name || !categoryName || !price || !description || !size || !bgImage) {
      setErrorMessage('Please fill all required fields, including the background image.');
      return;
    }

    // Validate JSON fields
    try {
      JSON.parse(textSettings);
      JSON.parse(overlaySettings);
    } catch {
      setErrorMessage('Text Settings and Overlay Settings must be valid JSON.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('categoryName', categoryName);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('size', size);
    formData.append('inStock', inStock);
    if (festivalDate) formData.append('festivalDate', festivalDate);
    if (tags) formData.append('tags', tags);
    if (email) formData.append('email', email);
    if (mobile) formData.append('mobile', mobile);
    if (title) formData.append('title', title);
    formData.append('textSettings', textSettings);
    formData.append('overlaySettings', overlaySettings);

    formData.append('bgImage', bgImage);

    imageFiles.forEach((file) => formData.append('images', file));

    try {
      const response = await axios.post(
        'http://194.164.148.244:4061/api/poster/create-canvaposter',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert('Poster created successfully!');
      navigate('/posterlist');

      // Reset form
      setName('');
      setCategoryName('');
      setPrice('');
      setBgImage(null);
      setImages([]);
      setImageFiles([]);
      setDescription('');
      setFestivalDate('');
      setSize('');
      setInStock(false);
      setTags('');
      setEmail('');
      setMobile('');
      setTitle('');
      setTextSettings('{}');
      setOverlaySettings('{}');
      setErrorMessage('');
    } catch (error) {
      console.error('Error creating poster:', error);
      setErrorMessage('Error creating poster. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center text-blue-900">Create New Poster</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Poster Name */}
          <div>
            <label className="block text-lg font-medium mb-2">Poster Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter poster name"
            />
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-lg font-medium mb-2">Category Name</label>
            <select
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-lg font-medium mb-2">Price</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>

          {/* Background Image Upload */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBgImageChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Overlay Images Upload */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Overlay Images (Optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleOverlayImagesChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            />
            {images.length > 0 && (
              <div className="mt-2 flex space-x-2 flex-wrap">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`preview-${idx}`}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Description</label>
            <textarea
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Enter poster description"
            />
          </div>

          {/* Festival Date */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">
              Festival Date <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={festivalDate}
              onChange={(e) => setFestivalDate(e.target.value)}
            />
          </div>

          {/* Size */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Size</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Enter size (e.g. A4, A3)"
            />
          </div>

          {/* In Stock */}
          <div className="col-span-1 flex items-center gap-3 mt-8">
            <input
              type="checkbox"
              checked={inStock}
              onChange={() => setInStock(!inStock)}
              className="w-5 h-5"
            />
            <label className="text-lg font-medium">In Stock</label>
          </div>

          {/* Tags */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Tags (comma separated)</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. summer, sale, festive"
            />
          </div>

          {/* Email */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          {/* Mobile */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Mobile</label>
            <input
              type="tel"
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>

          {/* Title */}
          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Title</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          {/* Text Settings */}
          <div className="col-span-full">
            <label className="block text-lg font-medium mb-2">Text Settings (JSON)</label>
            <textarea
              className="w-full p-3 border rounded-lg shadow-sm font-mono text-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={textSettings}
              onChange={(e) => setTextSettings(e.target.value)}
              rows="5"
              placeholder='{"fontSize":14,"color":"#000"}'
            />
          </div>

          {/* Overlay Settings */}
          <div className="col-span-full">
            <label className="block text-lg font-medium mb-2">Overlay Settings (JSON)</label>
            <textarea
              className="w-full p-3 border rounded-lg shadow-sm font-mono text-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={overlaySettings}
              onChange={(e) => setOverlaySettings(e.target.value)}
              rows="5"
              placeholder='{"opacity":0.5,"color":"#fff"}'
            />
          </div>
        </div>

        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 mt-4 rounded-lg text-white font-semibold text-lg transition-colors ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Create Poster'}
        </button>
      </form>
    </div>
  );
};

export default CreatePoster;

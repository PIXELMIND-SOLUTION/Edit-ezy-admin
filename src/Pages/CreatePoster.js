import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreatePoster = () => {
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); // For form submission
  const [description, setDescription] = useState('');
  const [festivalDate, setFestivalDate] = useState('');
  const [size, setSize] = useState('');
  const [inStock, setInStock] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    axios
      .get('https://posterbnaobackend.onrender.com/api/category/getall-cateogry')
      .then((response) => {
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages(previews);
    setImageFiles(files); // Save actual files for upload
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !categoryName || !price || !imageFiles.length || !description || !size) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('categoryName', categoryName);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('size', size);
    formData.append('inStock', inStock);
    if (festivalDate) {
      formData.append('festivalDate', festivalDate);
    }

    imageFiles.forEach((file) => formData.append('images', file));

    try {
      const response = await axios.post(
        'https://posterbnaobackend.onrender.com/api/poster/create-poster',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('Poster created successfully!');
      // Reset form
      setName('');
      setCategoryName('');
      setPrice('');
      setImages([]);
      setImageFiles([]);
      setDescription('');
      setFestivalDate('');
      setSize('');
      setInStock(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error creating poster:', error);
      setErrorMessage('Error creating poster. Please try again.');
    }
  };

  return (
    <div className="container p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center text-blue-900">Create New Poster</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <div className="col-span-1">
            <label className="block text-lg font-medium mb-2">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            />
            {images.length > 0 && (
              <div className="mt-2 flex space-x-2">
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

          <div className="col-span-1 flex items-center gap-3 mt-8">
            <input
              type="checkbox"
              checked={inStock}
              onChange={() => setInStock(!inStock)}
              className="w-5 h-5"
            />
            <label className="text-lg font-medium">In Stock</label>
          </div>
        </div>

        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition duration-300"
          >
            Create Poster
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoster;

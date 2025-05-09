import React, { useState } from 'react';

const CreateBusinessCard = () => {
  // States for all the required fields
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [tags, setTags] = useState('');
  const [inStock, setInStock] = useState(false);
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file)); // Preview images
    setImages(imageUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (!name || !categoryName || !price || !offerPrice || !description || !size || !tags || !images.length) {
      setErrorMessage('All fields are required');
      return;
    }

    // Prepare data to be sent to the server (simulate submission here)
    const businessCardData = {
      name,
      categoryName,
      price,
      offerPrice,
      description,
      size,
      tags: tags.split(',').map((tag) => tag.trim()), // Convert tags to array
      inStock,
      images,
    };

    // Simulating API call to create a business card (replace with actual API call)
    try {
      console.log('Business Card Created:', businessCardData);
      alert('Business card created successfully!');
      // Reset form after success
      setName('');
      setCategoryName('');
      setPrice('');
      setOfferPrice('');
      setDescription('');
      setSize('');
      setTags('');
      setInStock(false);
      setImages([]);
    } catch (error) {
      console.error('Error creating business card:', error);
      setErrorMessage('Error creating business card. Please try again.');
    }
  };

  return (
    <div className="container p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center text-blue-900">Create New Business Card</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Name Field */}
          <div>
            <label className="block text-lg font-medium mb-2">Full Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter business card name"
            />
          </div>

          {/* Category Name Field */}
          <div>
            <label className="block text-lg font-medium mb-2">Category Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category"
            />
          </div>

          {/* Price Field */}
          <div>
            <label className="block text-lg font-medium mb-2">Price</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>

          {/* Offer Price Field */}
          <div>
            <label className="block text-lg font-medium mb-2">Offer Price</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="Enter offer price"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-lg font-medium mb-2">Description</label>
            <textarea
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description"
            />
          </div>

          {/* Size Field */}
          <div>
            <label className="block text-lg font-medium mb-2">Size</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Enter size"
            />
          </div>

          {/* Tags Field */}
          <div>
            <label className="block text-lg font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags (e.g. sale, new)"
            />
          </div>

          {/* In Stock Checkbox */}
          <div className="col-span-2">
            <label className="block text-lg font-medium mb-2">In Stock</label>
            <input
              type="checkbox"
              className="p-3"
              checked={inStock}
              onChange={() => setInStock(!inStock)}
            />
            <span className="ml-2">Available for sale</span>
          </div>

          {/* Image Upload Section */}
          <div className="col-span-2">
            <label className="block text-lg font-medium mb-2">Upload Images</label>
            <input
              type="file"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <div className="mt-2">
              {images.length > 0 && (
                <div className="flex space-x-2">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`preview-${index}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-900 text-white p-3 rounded-lg shadow-md hover:bg-blue-900 transition duration-300"
          >
            Create Business Card
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBusinessCard;

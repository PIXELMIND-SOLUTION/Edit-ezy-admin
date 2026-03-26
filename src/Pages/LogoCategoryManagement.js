import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner
} from 'reactstrap';
import { FaEdit, FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import axios from 'axios';

const LogoCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', image: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = React.useRef(null);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://31.97.206.144:4061/api/admin/getlogocategories');
      console.log('Categories response:', response.data);
      
      let categoriesData = [];
      if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Get category name safely
  const getCategoryName = (category) => {
    if (!category) return 'Unnamed';
    return category.name || category.categoryName || 'Unnamed';
  };

  // Get category image safely
  const getCategoryImage = (category) => {
    if (!category) return '';
    return category.image || '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentCategory({ ...currentCategory, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentCategory({ name: '', image: null });
    setPreviewImage(null);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setIsEditing(true);
    setCurrentCategory({
      id: category._id,
      name: getCategoryName(category),
      image: null
    });
    setPreviewImage(getCategoryImage(category));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentCategory.name || !currentCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('name', currentCategory.name.trim());

    if (currentCategory.image && typeof currentCategory.image !== 'string') {
      formData.append('image', currentCategory.image);
    }

    try {
      if (isEditing) {
        await axios.put(
          `http://31.97.206.144:4061/api/admin/updatelogocategory/${currentCategory.id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        await axios.post(
          'http://31.97.206.144:4061/api/admin/createlogocategory',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    
    try {
      await axios.delete(`http://31.97.206.144:4061/api/admin/deletelogocategory/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const getCategoryDisplayName = (category) => {
    const name = getCategoryName(category);
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading categories...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Logo Categories</h2>
        <Button color="primary" onClick={openAddModal}>
          <FaPlus className="me-2" /> Add Category
        </Button>
      </div>

      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {categories.length === 0 ? (
        <Alert color="info">No categories found. Click "Add Category" to create one.</Alert>
      ) : (
        <Table bordered hover responsive>
          <thead className="bg-primary text-white">
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Category Name</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category._id || index}>
                <td>{index + 1}</td>
                <td className="text-center">
                  {getCategoryImage(category) ? (
                    <img
                      src={getCategoryImage(category)}
                      alt={getCategoryName(category)}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                      }}
                    />
                  ) : (
                    <FaImage size={30} className="text-muted" />
                  )}
                </td>
                <td className="fw-bold">{getCategoryDisplayName(category)}</td>
                <td>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <Button
                    size="sm"
                    color="warning"
                    className="me-2"
                    onClick={() => openEditModal(category)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(category._id, getCategoryName(category))}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for Add/Edit */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="md">
        <ModalHeader toggle={() => setModalOpen(false)}>
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Category Name *</Label>
              <Input
                type="text"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                placeholder="Enter category name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Category Image</Label>
              <div
                className="border rounded p-3 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    <FaImage size={40} className="text-muted mb-2" />
                    <p className="text-muted mb-0">Click to upload image</p>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={handleImageChange}
                accept="image/*"
              />
              <small className="text-muted">Supported formats: JPG, PNG, GIF, SVG, WEBP (Max 5MB)</small>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner size="sm" className="me-2" /> : null}
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default LogoCategoryManagement;
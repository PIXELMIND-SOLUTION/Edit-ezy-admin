import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle,
  Alert,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Pagination,
  PaginationItem,
  PaginationLink
} from 'reactstrap';
import axios from 'axios';
import { 
  FaCloudUploadAlt, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaTimes,
  FaPlus,
  FaImage,
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';

const LogoCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 items per page
  
  // Alert states
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Form states
  const [formData, setFormData] = useState({
    categoryName: '',
    image: null
  });
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // View modal data
  const [viewData, setViewData] = useState(null);

  // Show alert
  const showAlert = (message, type = 'success') => {
    setAlert({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://31.97.206.144:4061/api/admin/getlogocategories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Failed to load categories', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to first page
  const goToFirstPage = () => setCurrentPage(1);
  
  // Go to last page
  const goToLastPage = () => setCurrentPage(totalPages);
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Show max 5 page numbers
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages with ellipsis logic
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditMode(false);
    setFormData({
      categoryName: '',
      image: null
    });
    setPreviewImage(null);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (category) => {
    setEditMode(true);
    setCurrentCategoryId(category._id);
    setFormData({
      categoryName: category.categoryName,
      image: null
    });
    const imageUrl = category.image !== 'default-category-image.jpg' ? category.image : null;
    setPreviewImage(imageUrl);
    setModalOpen(true);
  };

  // Open view modal
  const openViewModal = (category) => {
    setViewData(category);
    setViewModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (id) => {
    setCurrentCategoryId(id);
    setDeleteModalOpen(true);
  };

  // Handle form submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      showAlert('Category name is required', 'danger');
      return;
    }

    if (!editMode && !formData.image) {
      showAlert('Category image is required', 'danger');
      return;
    }

    setModalLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('categoryName', formData.categoryName);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editMode) {
        await axios.put(
          `http://31.97.206.144:4061/api/admin/updatelogocategory/${currentCategoryId}`,
          formDataToSend,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        showAlert('Category updated successfully!');
      } else {
        await axios.post(
          'http://31.97.206.144:4061/api/admin/createlogocategory',
          formDataToSend,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        showAlert('Category created successfully!');
      }

      setModalOpen(false);
      setFormData({ categoryName: '', image: null });
      setPreviewImage(null);
      fetchCategories();
      setCurrentPage(1); // Reset to first page after create/update
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.message || 'Error saving category';
      showAlert(errorMessage, 'danger');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await axios.delete(`http://31.97.206.144:4061/api/admin/deletelogocategory/${currentCategoryId}`);
      showAlert('Category deleted successfully!');
      setDeleteModalOpen(false);
      fetchCategories();
      // Adjust current page if last item on page is deleted
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showAlert('Error deleting category', 'danger');
    } finally {
      setModalLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <Container fluid className="py-4">
        {/* Alert */}
        {alert.show && (
          <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <Alert 
              color={alert.type} 
              className="shadow-lg"
              toggle={() => setAlert({ show: false, message: '', type: 'success' })}
            >
              {alert.message}
            </Alert>
          </div>
        )}

        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">Logo Categories</h2>
                <p className="text-muted mb-0">Manage your logo categories</p>
              </div>
              <Button color="primary" onClick={openCreateModal}>
                <FaPlus className="me-2" />
                Add New Category
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Left Column - Form */}
          <Col lg={4} className="mb-4 mb-lg-0">
            <Card className="shadow-sm">
              <CardBody>
                <div className="d-flex align-items-center mb-3">
                  <FaImage className="me-2 text-primary" />
                  <CardTitle tag="h5" className="mb-0">
                    Create Logo Category
                  </CardTitle>
                </div>
                
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="categoryName" className="fw-bold">Category Name *</Label>
                    <Input
                      type="text"
                      id="categoryName"
                      name="categoryName"
                      value={formData.categoryName}
                      onChange={handleInputChange}
                      placeholder="Enter category name"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="image" className="fw-bold">Category Image *</Label>
                    <div className="border rounded p-3 text-center">
                      {previewImage ? (
                        <div className="text-center">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="img-thumbnail mb-3"
                            style={{ maxHeight: '150px', objectFit: 'contain' }}
                          />
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              type="button"
                              color="secondary"
                              size="sm"
                              onClick={() => document.getElementById('imageUpload').click()}
                            >
                              Change Image
                            </Button>
                            <Button
                              type="button"
                              color="danger"
                              size="sm"
                              onClick={() => {
                                setPreviewImage(null);
                                setFormData(prev => ({ ...prev, image: null }));
                              }}
                            >
                              <FaTimes className="me-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <FaCloudUploadAlt size={48} className="text-muted mb-3" />
                          <p className="text-muted mb-2">Upload category image</p>
                          <Button
                            type="button"
                            color="light"
                            onClick={() => document.getElementById('imageUpload').click()}
                          >
                            Choose File
                          </Button>
                          <p className="text-muted mt-2 small">
                            Supported formats: JPG, PNG, GIF
                          </p>
                        </div>
                      )}
                      <Input
                        type="file"
                        id="imageUpload"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </FormGroup>

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      color="primary" 
                      disabled={!formData.categoryName || (!editMode && !formData.image)}
                    >
                      {editMode ? 'Update Category' : 'Create Category'}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>

            {/* Stats Card */}
            <Card className="shadow-sm mt-3">
              <CardBody>
                <div className="d-flex align-items-center mb-3">
                  <FaList className="me-2 text-success" />
                  <CardTitle tag="h5" className="mb-0">Statistics</CardTitle>
                </div>
                <div className="text-center">
                  <h1 className="display-4 text-primary">{categories.length}</h1>
                  <p className="text-muted mb-0">Total Categories</p>
                </div>
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Showing {currentItems.length} of {categories.length} categories
                  </small>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Right Column - List */}
          <Col lg={8}>
            <Card className="shadow-sm">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <FaList className="me-2 text-primary" />
                    <CardTitle tag="h5" className="mb-0">
                      All Categories ({categories.length})
                    </CardTitle>
                  </div>
                  <div className="text-muted">
                    <small>Page {currentPage} of {totalPages}</small>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading categories...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-5">
                    <FaImage size={48} className="text-muted mb-3" />
                    <h5>No categories found</h5>
                    <p className="text-muted">Start by creating your first logo category</p>
                    <Button color="primary" onClick={openCreateModal}>
                      <FaPlus className="me-2" />
                      Create Category
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th width="60">#</th>
                            <th>Category</th>
                            <th>Image</th>
                            <th>Created</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((category, index) => (
                            <tr key={category._id}>
                              <td className="fw-bold">{indexOfFirstItem + index + 1}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    <Badge color="light" className="text-dark">
                                      {category.categoryName.charAt(0).toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div>
                                    <div className="fw-medium">{category.categoryName}</div>
                                    <small className="text-muted">ID: {category._id.substring(0, 8)}...</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {category.image && category.image !== 'default-category-image.jpg' ? (
                                  <img
                                    src={category.image}
                                    alt={category.categoryName}
                                    className="img-thumbnail"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="bg-light d-flex align-items-center justify-content-center" 
                                       style={{ width: '50px', height: '50px' }}>
                                    <FaImage className="text-muted" size={20} />
                                  </div>
                                )}
                              </td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(category.createdAt)}
                                </small>
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center gap-2">
                                  <Button
                                    color="info"
                                    size="sm"
                                    onClick={() => openViewModal(category)}
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </Button>
                                  <Button
                                    color="warning"
                                    size="sm"
                                    onClick={() => openEditModal(category)}
                                    title="Edit Category"
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(category._id)}
                                    title="Delete Category"
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted small">
                          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, categories.length)} of {categories.length} entries
                        </div>
                        
                        <Pagination size="sm">
                          <PaginationItem disabled={currentPage === 1}>
                            <PaginationLink onClick={goToFirstPage}>
                              <FaAngleDoubleLeft />
                            </PaginationLink>
                          </PaginationItem>
                          
                          <PaginationItem disabled={currentPage === 1}>
                            <PaginationLink onClick={goToPreviousPage}>
                              <FaChevronLeft />
                            </PaginationLink>
                          </PaginationItem>
                          
                          {getPageNumbers().map((number, index) => (
                            <PaginationItem 
                              key={index} 
                              active={currentPage === number}
                              disabled={number === '...'}
                            >
                              {number === '...' ? (
                                <PaginationLink disabled>...</PaginationLink>
                              ) : (
                                <PaginationLink onClick={() => paginate(number)}>
                                  {number}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem disabled={currentPage === totalPages}>
                            <PaginationLink onClick={goToNextPage}>
                              <FaChevronRight />
                            </PaginationLink>
                          </PaginationItem>
                          
                          <PaginationItem disabled={currentPage === totalPages}>
                            <PaginationLink onClick={goToLastPage}>
                              <FaAngleDoubleRight />
                            </PaginationLink>
                          </PaginationItem>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg">
        <ModalHeader toggle={() => setModalOpen(false)}>
          {editMode ? 'Edit Category' : 'Create New Category'}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="modalCategoryName">Category Name *</Label>
              <Input
                type="text"
                id="modalCategoryName"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label for="modalImage">
                Category Image {!editMode && '*'}
              </Label>
              <div className="border rounded p-3 text-center">
                {previewImage ? (
                  <div className="text-center">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="img-thumbnail mb-3"
                      style={{ maxHeight: '200px', objectFit: 'contain' }}
                    />
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        type="button"
                        color="secondary"
                        size="sm"
                        onClick={() => document.getElementById('modalImageUpload').click()}
                      >
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        color="danger"
                        size="sm"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        <FaTimes className="me-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <FaCloudUploadAlt size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-2">Upload category image</p>
                    <Button
                      type="button"
                      color="light"
                      onClick={() => document.getElementById('modalImageUpload').click()}
                    >
                      Choose File
                    </Button>
                    {!editMode && (
                      <p className="text-danger mt-2 small">
                        * Required for new category
                      </p>
                    )}
                  </div>
                )}
                <Input
                  type="file"
                  id="modalImageUpload"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setModalOpen(false)}
              disabled={modalLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={modalLoading || !formData.categoryName || (!editMode && !formData.image)}
            >
              {modalLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {editMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editMode ? 'Update Category' : 'Create Category'
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(false)} size="md">
        <ModalHeader toggle={() => setViewModalOpen(false)}>
          Category Details
        </ModalHeader>
        <ModalBody>
          {viewData && (
            <div className="text-center">
              {viewData.image && viewData.image !== 'default-category-image.jpg' ? (
                <img
                  src={viewData.image}
                  alt={viewData.categoryName}
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: '250px', objectFit: 'contain' }}
                />
              ) : (
                <div className="bg-light p-5 rounded mb-3">
                  <FaImage size={64} className="text-muted" />
                  <p className="text-muted mt-2">No image available</p>
                </div>
              )}
              <h4 className="mb-2">{viewData.categoryName}</h4>
              <div className="text-muted mb-3">
                <small>
                  Created: {formatDate(viewData.createdAt)}
                </small>
              </div>
              <div className="bg-light p-3 rounded">
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted d-block">Category ID</small>
                    <code className="small">{viewData._id}</code>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Status</small>
                    <Badge color="success" className="mt-1">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
          {viewData && (
            <Button
              color="primary"
              onClick={() => {
                setViewModalOpen(false);
                openEditModal(viewData);
              }}
            >
              <FaEdit className="me-1" />
              Edit
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)}>
        <ModalHeader toggle={() => setDeleteModalOpen(false)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <div className="mb-3">
              <FaTrash size={48} className="text-danger" />
            </div>
            <h5>Are you sure?</h5>
            <p className="text-muted">
              This action will permanently delete the category. This cannot be undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setDeleteModalOpen(false)}
            disabled={modalLoading}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={handleDelete}
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default LogoCategoryManagement;
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
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';

const StickerManagement = () => {
  const [stickers, setStickers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Alert states
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Form states
  const [formData, setFormData] = useState({
    stickerCategoryId: '',
    image: null
  });
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStickerId, setCurrentStickerId] = useState(null);
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

  // Fetch all stickers
  const fetchStickers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://31.97.228.17:4061/api/admin/allsticker');
      setStickers(response.data.stickers || []);
    } catch (error) {
      console.error('Error fetching stickers:', error);
      showAlert('Failed to load stickers', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all sticker categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://31.97.228.17:4061/api/admin/allsticker-category');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Failed to load sticker categories', 'danger');
    }
  };

  useEffect(() => {
    fetchStickers();
    fetchCategories();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = stickers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(stickers.length / itemsPerPage);

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
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
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
      stickerCategoryId: '',
      image: null
    });
    setPreviewImage(null);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (sticker) => {
    setEditMode(true);
    setCurrentStickerId(sticker._id);
    setFormData({
      stickerCategoryId: sticker.stickerCategoryId?._id || sticker.stickerCategoryId,
      image: null
    });
    setPreviewImage(sticker.image);
    setModalOpen(true);
  };

  // Open view modal
  const openViewModal = (sticker) => {
    setViewData(sticker);
    setViewModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (id) => {
    setCurrentStickerId(id);
    setDeleteModalOpen(true);
  };

  // Handle form submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.stickerCategoryId) {
      showAlert('Please select a sticker category', 'danger');
      return;
    }

    if (!editMode && !formData.image) {
      showAlert('Sticker image is required', 'danger');
      return;
    }

    setModalLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('stickerCategoryId', formData.stickerCategoryId);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editMode) {
        await axios.put(
          `http://31.97.228.17:4061/api/admin/updatesticker/${currentStickerId}`,
          formDataToSend,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        showAlert('Sticker updated successfully!');
      } else {
        await axios.post(
          'http://31.97.228.17:4061/api/admin/createsticker',
          formDataToSend,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        showAlert('Sticker created successfully!');
      }

      setModalOpen(false);
      setFormData({ stickerCategoryId: '', image: null });
      setPreviewImage(null);
      fetchStickers();
      setCurrentPage(1);
    } catch (error) {
      console.error('Error saving sticker:', error);
      const errorMessage = error.response?.data?.message || 'Error saving sticker';
      showAlert(errorMessage, 'danger');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await axios.delete(`http://31.97.228.17:4061/api/admin/deletesticker/${currentStickerId}`);
      showAlert('Sticker deleted successfully!');
      setDeleteModalOpen(false);
      fetchStickers();
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting sticker:', error);
      showAlert('Error deleting sticker', 'danger');
    } finally {
      setModalLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
                <h2 className="mb-1">Sticker Management</h2>
                <p className="text-muted mb-0">Manage your stickers</p>
              </div>
              <Button color="primary" onClick={openCreateModal}>
                <FaPlus className="me-2" />
                Add New Sticker
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
                  <CardTitle tag="h5" className="mb-0">
                    {editMode ? 'Edit Sticker' : 'Create New Sticker'}
                  </CardTitle>
                </div>
                
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="stickerCategoryId" className="fw-bold">Sticker Category *</Label>
                    <Input
                      type="select"
                      id="stickerCategoryId"
                      name="stickerCategoryId"
                      value={formData.stickerCategoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Sticker Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>

                  <FormGroup>
                    <Label for="image" className="fw-bold">Sticker Image {!editMode && '*'}</Label>
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
                          <p className="text-muted mb-2">Upload sticker image</p>
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
                      disabled={!formData.stickerCategoryId || (!editMode && !formData.image)}
                    >
                      {editMode ? 'Update Sticker' : 'Create Sticker'}
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
                  <h1 className="display-4 text-primary">{stickers.length}</h1>
                  <p className="text-muted mb-0">Total Stickers</p>
                </div>
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Showing {currentItems.length} of {stickers.length} stickers
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
                      All Stickers ({stickers.length})
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
                    <p className="mt-3 text-muted">Loading stickers...</p>
                  </div>
                ) : stickers.length === 0 ? (
                  <div className="text-center py-5">
                    <h5>No stickers found</h5>
                    <p className="text-muted">Start by creating your first sticker</p>
                    <Button color="primary" onClick={openCreateModal}>
                      <FaPlus className="me-2" />
                      Create Sticker
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th width="60">#</th>
                            <th>Sticker Image</th>
                            <th>Category</th>
                            <th>Created Date</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((sticker, index) => (
                            <tr key={sticker._id}>
                              <td className="fw-bold">{indexOfFirstItem + index + 1}</td>
                              <td>
                                {sticker.image ? (
                                  <img
                                    src={sticker.image}
                                    alt="Sticker"
                                    className="img-thumbnail"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                                    onClick={() => openViewModal(sticker)}
                                  />
                                ) : (
                                  <div className="bg-light d-flex align-items-center justify-content-center" 
                                       style={{ width: '50px', height: '50px' }}>
                                  </div>
                                )}
                              </td>
                              <td>
                                <Badge color="info" className="px-3 py-2">
                                  {sticker.stickerCategoryId?.name || 'N/A'}
                                </Badge>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(sticker.createdAt)}
                                </small>
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center gap-2">
                                  <Button
                                    color="info"
                                    size="sm"
                                    onClick={() => openViewModal(sticker)}
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </Button>
                                  <Button
                                    color="warning"
                                    size="sm"
                                    onClick={() => openEditModal(sticker)}
                                    title="Edit Sticker"
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(sticker._id)}
                                    title="Delete Sticker"
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
                          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, stickers.length)} of {stickers.length} entries
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
          {editMode ? 'Edit Sticker' : 'Create New Sticker'}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="modalCategory" className="fw-bold">Sticker Category *</Label>
              <Input
                type="select"
                id="modalCategory"
                name="stickerCategoryId"
                value={formData.stickerCategoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Sticker Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup>
              <Label for="modalImage">
                Sticker Image {!editMode && '*'}
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
                    <p className="text-muted mb-2">Upload sticker image</p>
                    <Button
                      type="button"
                      color="light"
                      onClick={() => document.getElementById('modalImageUpload').click()}
                    >
                      Choose File
                    </Button>
                    {!editMode && (
                      <p className="text-danger mt-2 small">
                        * Required for new sticker
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
              disabled={modalLoading || !formData.stickerCategoryId || (!editMode && !formData.image)}
            >
              {modalLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {editMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editMode ? 'Update Sticker' : 'Create Sticker'
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(false)} size="md">
        <ModalHeader toggle={() => setViewModalOpen(false)}>
          Sticker Details
        </ModalHeader>
        <ModalBody>
          {viewData && (
            <div className="text-center">
              {viewData.image ? (
                <img
                  src={viewData.image}
                  alt="Sticker"
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: '250px', objectFit: 'contain' }}
                />
              ) : (
                <div className="bg-light p-5 rounded mb-3">
                  <p className="text-muted mt-2">No image available</p>
                </div>
              )}
              <h4 className="mb-2">Sticker Details</h4>
              <div className="mb-3">
                <Badge color="info" className="px-3 py-2">
                  Category: {viewData.stickerCategoryId?.name || 'N/A'}
                </Badge>
              </div>
              <div className="text-muted mb-3">
                <small>
                  Created: {formatDate(viewData.createdAt)}
                </small>
              </div>
              <div className="bg-light p-3 rounded">
                <div className="row">
                  <div className="col-12">
                    <small className="text-muted d-block">Sticker ID</small>
                    <code className="small">{viewData._id}</code>
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
              This action will permanently delete this sticker. This cannot be undone.
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
              'Delete Sticker'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default StickerManagement;
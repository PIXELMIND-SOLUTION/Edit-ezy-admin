import React, { useState, useEffect } from 'react';
import {
  Row, Col, Form, FormGroup, Label, Input, Button, Table, Card, CardBody,
  Modal, ModalHeader, ModalBody, ModalFooter, Pagination, PaginationItem, PaginationLink,
  Spinner, Alert, Badge
} from 'reactstrap';
import axios from 'axios';
import { FaTrash, FaEdit, FaUpload, FaPlay, FaHeart, FaRegHeart, FaFire } from 'react-icons/fa';

const ManageReels = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [hotTop, setHotTop] = useState(false); // ✅ HotTop state for create form
  const [reels, setReels] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ✅ Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [editVideoPreview, setEditVideoPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editLikeCount, setEditLikeCount] = useState(0);
  const [editIsLiked, setEditIsLiked] = useState(false);
  const [editHotTop, setEditHotTop] = useState(false);

  // ✅ Video Modal State
  const [videoModal, setVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const reelsPerPage = 5;
  const totalPages = Math.ceil(reels.length / reelsPerPage);

  const paginatedReels = reels.slice(
    (currentPage - 1) * reelsPerPage,
    currentPage * reelsPerPage
  );

  // API Base URL
  const API_BASE_URL = 'http://31.97.206.144:4061/api/admin';

  const fetchReels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/getallreels`);
      setReels(res.data.reels || []);
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError('Failed to fetch reels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      setError('Please select a video file only');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Maximum file size is 50MB');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleEditVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      setError('Please select a video file only');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Maximum file size is 50MB');
      return;
    }

    setEditVideoFile(file);
    setEditVideoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please upload a video');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('hotTop', hotTop); // ✅ Send hotTop value

    try {
      await axios.post(`${API_BASE_URL}/createreel`, formData);
      setSuccess('Reel created successfully!');
      fetchReels();
      setVideoFile(null);
      setVideoPreview(null);
      setHotTop(false); // ✅ Reset hotTop after submission
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating reel:', err);
      setError(err.response?.data?.message || 'Failed to create reel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      await axios.delete(`${API_BASE_URL}/deletereel/${id}`);
      setSuccess('Reel deleted successfully!');
      fetchReels();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting reel:', err);
      setError(err.response?.data?.message || 'Failed to delete reel');
    }
  };

  const handleLikeToggle = async (reel) => {
    const formData = new FormData();
    const newLike = !reel.isLiked;
    const count = newLike ? reel.likeCount + 1 : Math.max(0, reel.likeCount - 1);

    formData.append('isLiked', newLike);
    formData.append('likeCount', count);
    formData.append('hotTop', reel.hotTop);

    try {
      await axios.put(`${API_BASE_URL}/updatereel/${reel._id}`, formData);
      fetchReels();
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to update like status');
    }
  };

  const openEditModal = (reel) => {
    setEditId(reel._id);
    setEditLikeCount(reel.likeCount);
    setEditIsLiked(reel.isLiked);
    setEditHotTop(reel.hotTop || false);
    setEditVideoFile(null);
    setEditVideoPreview(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const formData = new FormData();
    
    if (editVideoFile) {
      formData.append('video', editVideoFile);
    }
    
    formData.append('likeCount', editLikeCount);
    formData.append('isLiked', editIsLiked);
    formData.append('hotTop', editHotTop);

    try {
      await axios.put(`${API_BASE_URL}/updatereel/${editId}`, formData);
      setSuccess('Reel updated successfully!');
      setEditModalOpen(false);
      fetchReels();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating reel:', err);
      setError(err.response?.data?.message || 'Failed to update reel');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPagination = () => {
    const pages = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const openVideoModal = (url) => {
    setSelectedVideo(url);
    setVideoModal(true);
  };

  return (
    <div className="container my-4">
      {/* Alert Messages */}
      {error && (
        <Alert color="danger" className="mb-4" toggle={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" className="mb-4" toggle={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Row className="g-4">
        {/* Upload Section */}
        <Col xs={12} lg={5}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody className="p-4">
              <h5 className="text-primary mb-3">
                <FaUpload className="me-2" /> Create New Reel
              </h5>

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Upload Video *</Label>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <label className="btn btn-outline-primary btn-sm">
                      <FaUpload /> Choose Video
                      <Input 
                        type="file" 
                        hidden 
                        onChange={handleVideoChange}
                        accept="video/*"
                      />
                    </label>
                    <span className="text-muted small">Max 50MB (MP4, MOV, etc.)</span>
                  </div>
                  <small className="text-muted d-block mt-1">
                    Video will have "EDITEZY" watermark overlay automatically
                  </small>
                </FormGroup>

                {/* ✅ HotTop Toggle/Slider */}
                <FormGroup className="mt-3">
                  <Label className="d-flex align-items-center gap-2">
                    <FaFire className={hotTop ? "text-danger" : "text-muted"} />
                    Mark as Hot/Top Reel
                  </Label>
                  <div className="d-flex align-items-center gap-3">
                    <Input
                      type="switch"
                      checked={hotTop}
                      onChange={(e) => setHotTop(e.target.checked)}
                      style={{ width: '50px', height: '25px' }}
                    />
                    <span className={hotTop ? "text-danger fw-bold" : "text-muted"}>
                      {hotTop ? "Hot Reel - Will be highlighted" : "Normal Reel"}
                    </span>
                  </div>
                  <small className="text-muted d-block mt-1">
                    Hot reels appear with a fire badge and get priority visibility
                  </small>
                </FormGroup>

                {videoPreview && (
                  <div className="mt-3">
                    <video
                      src={videoPreview}
                      controls
                      className="w-100 rounded border"
                      style={{ maxHeight: 250, objectFit: 'cover' }}
                    />
                    <Button
                      color="danger"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                    >
                      Remove Video
                    </Button>
                  </div>
                )}

                <Button 
                  color="primary" 
                  className="mt-3 w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Uploading...
                    </>
                  ) : (
                    'Create Reel'
                  )}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Table Section */}
        <Col xs={12} lg={7}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody className="p-3">
              <h5 className="mb-3 d-flex justify-content-between align-items-center">
                <span>All Reels ({reels.length})</span>
                {loading && <Spinner size="sm" color="primary" />}
              </h5>

              {loading && reels.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />
                  <p className="mt-2 text-muted">Loading reels...</p>
                </div>
              ) : reels.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>No reels found. Create your first reel!</p>
                </div>
              ) : (
                <>
                  <Table responsive hover className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Video</th>
                        <th>Likes</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedReels.map((reel, i) => (
                        <tr key={reel._id}>
                          <td>{(currentPage - 1) * reelsPerPage + i + 1}</td>

                          {/* Clickable Video */}
                          <td style={{ minWidth: 120 }}>
                            <div
                              style={{ position: 'relative', cursor: 'pointer' }}
                              onClick={() => openVideoModal(reel.videoUrl)}
                            >
                              <video
                                src={reel.videoUrl}
                                className="w-100 rounded"
                                style={{ height: 80, objectFit: 'cover' }}
                              />
                              <FaPlay
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  color: '#fff',
                                  fontSize: '18px',
                                  opacity: 0.8
                                }}
                              />
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Button 
                                size="sm" 
                                color="link" 
                                onClick={() => handleLikeToggle(reel)}
                                className="p-0"
                              >
                                {reel.isLiked ? 
                                  <FaHeart className="text-danger" size={18} /> : 
                                  <FaRegHeart size={18} />
                                }
                              </Button>
                              <span className="fw-semibold">{reel.likeCount}</span>
                            </div>
                          </td>

                          <td>
                            {reel.hotTop && (
                              <Badge color="danger" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                                <FaFire size={12} /> Hot
                              </Badge>
                            )}
                          </td>

                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              <Button 
                                size="sm" 
                                color="primary"
                                onClick={() => openEditModal(reel)}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                size="sm" 
                                color="danger" 
                                onClick={() => handleDelete(reel._id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="justify-content-center flex-wrap mt-3">
                      <PaginationItem disabled={currentPage === 1}>
                        <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
                      </PaginationItem>

                      {getPagination().map((p, i) => (
                        <PaginationItem key={i} active={p === currentPage} disabled={p === '...'}>
                          <PaginationLink onClick={() => p !== '...' && handlePageChange(p)}>
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem disabled={currentPage === totalPages}>
                        <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
                      </PaginationItem>
                    </Pagination>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Edit Reel Modal */}
      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(false)} size="lg">
        <ModalHeader toggle={() => setEditModalOpen(false)}>
          Edit Reel
        </ModalHeader>
        <Form onSubmit={handleEditSubmit}>
          <ModalBody>
            <FormGroup>
              <Label>Update Video (Optional)</Label>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <label className="btn btn-outline-primary btn-sm">
                  <FaUpload /> Choose New Video
                  <Input 
                    type="file" 
                    hidden 
                    onChange={handleEditVideoChange}
                    accept="video/*"
                  />
                </label>
                <span className="text-muted small">Leave empty to keep current video</span>
              </div>
              {editVideoPreview && (
                <div className="mt-2">
                  <video
                    src={editVideoPreview}
                    controls
                    className="w-100 rounded"
                    style={{ maxHeight: 150, objectFit: 'cover' }}
                  />
                  <Button
                    color="danger"
                    size="sm"
                    className="mt-1"
                    onClick={() => {
                      setEditVideoFile(null);
                      setEditVideoPreview(null);
                    }}
                  >
                    Remove New Video
                  </Button>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Like Count</Label>
              <Input
                type="number"
                value={editLikeCount}
                onChange={(e) => setEditLikeCount(parseInt(e.target.value) || 0)}
                min="0"
              />
            </FormGroup>

            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  checked={editIsLiked}
                  onChange={(e) => setEditIsLiked(e.target.checked)}
                />{' '}
                Liked Status
              </Label>
            </FormGroup>

            <FormGroup check className="mt-2">
              <Label check className="d-flex align-items-center gap-2">
                <Input
                  type="checkbox"
                  checked={editHotTop}
                  onChange={(e) => setEditHotTop(e.target.checked)}
                />{' '}
                <FaFire className="text-danger" /> Mark as Hot/Top Reel
              </Label>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Update Reel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Video Preview Modal */}
      <Modal isOpen={videoModal} toggle={() => setVideoModal(false)} centered size="lg">
        <ModalHeader toggle={() => setVideoModal(false)}>
          Reel Preview
        </ModalHeader>
        <ModalBody className="text-center p-2">
          {selectedVideo && (
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-100 rounded"
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ManageReels;
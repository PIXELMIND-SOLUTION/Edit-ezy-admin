import React, { useState, useEffect } from 'react';
import {
  Row, Col, Form, FormGroup, Label, Input, Button, Table, Card, CardBody,
  Modal, ModalHeader, ModalBody, ModalFooter, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import axios from 'axios';
import { FaTrash, FaEdit, FaUpload, FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';

const ManageReels = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [reels, setReels] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Video Modal State
  const [videoModal, setVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const reelsPerPage = 5;
  const totalPages = Math.ceil(reels.length / reelsPerPage);

  const paginatedReels = reels.slice(
    (currentPage - 1) * reelsPerPage,
    currentPage * reelsPerPage
  );

  const fetchReels = async () => {
    try {
      const res = await axios.post('http://31.97.206.144:4061/api/admin/getallreels');
      setReels(res.data.reels || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('video/')) return alert('Select video only');
    if (file.size > 50 * 1024 * 1024) return alert('Max 50MB');

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return alert("Upload video");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      await axios.post('http://31.97.206.144:4061/api/admin/createreel', formData);
      fetchReels();
      setVideoFile(null);
      setVideoPreview(null);
    } catch {
      alert('Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reel?')) return;
    await axios.delete(`http://31.97.206.144:4061/api/admin/deletereel/${id}`);
    fetchReels();
  };

  const handleLikeToggle = async (reel) => {
    const formData = new FormData();
    const newLike = !reel.isLiked;
    const count = newLike ? reel.likeCount + 1 : Math.max(0, reel.likeCount - 1);

    formData.append('isLiked', newLike);
    formData.append('likeCount', count);

    await axios.put(`http://31.97.206.144:4061/api/admin/updatereel/${reel._id}`, formData);
    fetchReels();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ✅ Ellipsis Pagination
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

  // ✅ Open Video Modal
  const openVideoModal = (url) => {
    setSelectedVideo(url);
    setVideoModal(true);
  };

  return (
    <div className="container my-4">
      <Row className="g-4">

        {/* Upload */}
        <Col xs={12} lg={5}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody className="p-4">
              <h5 className="text-primary mb-3">Create Reel</h5>

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Upload Video</Label>
                  <div className="d-flex flex-wrap gap-2">
                    <label className="btn btn-outline-primary btn-sm">
                      <FaUpload /> Select
                      <Input type="file" hidden onChange={handleVideoChange} />
                    </label>
                    <span className="text-muted small">Max 50MB</span>
                  </div>
                </FormGroup>

                {videoPreview && (
                  <video
                    src={videoPreview}
                    controls
                    className="w-100 rounded border mt-3"
                    style={{ maxHeight: 250, objectFit: 'cover' }}
                  />
                )}

                <Button color="primary" className="mt-3 w-100">
                  {isSubmitting ? 'Uploading...' : 'Create'}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Table */}
        <Col xs={12} lg={7}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody className="p-3">
              <h5 className="mb-3">All Reels</h5>

              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Video</th>
                    <th>Likes</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedReels.map((reel, i) => (
                    <tr key={reel._id}>
                      <td>{i + 1}</td>

                      {/* ✅ Clickable Video */}
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
                          <Button size="sm" color="link" onClick={() => handleLikeToggle(reel)}>
                            {reel.isLiked ? <FaHeart className="text-danger" /> : <FaRegHeart />}
                          </Button>
                          {reel.likeCount}
                        </div>
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <Button size="sm" color="primary"><FaEdit /></Button>
                          <Button size="sm" color="danger" onClick={() => handleDelete(reel._id)}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* ✅ Pagination */}
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
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ✅ Video Modal */}
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
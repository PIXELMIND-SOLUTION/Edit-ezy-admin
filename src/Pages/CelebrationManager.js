// CelebrationManager.jsx - Fixed JSX Error
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Alert,
  Spinner,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table
} from 'reactstrap';
import { 
  FaVideo, 
  FaSave, 
  FaTrash, 
  FaEdit, 
  FaPlus, 
  FaPalette,
  FaFillDrip,
  FaEye,
  FaFileVideo,
  FaFileImage,
  FaTimes,
  FaCheck,
  FaUpload,
  FaGift,
  FaArrowUp,
  FaArrowDown,
  FaCopy,
  FaRandom,
  FaInfoCircle
} from 'react-icons/fa';
import axios from 'axios';

const CelebrationManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  const [celebrations, setCelebrations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedCelebration, setSelectedCelebration] = useState(null);
  const [gradientAngle, setGradientAngle] = useState(135);
  
  // Form Data
  const [formData, setFormData] = useState({
    enabled: true,
    video_url: '',
    duration_seconds: 5,
    loop: true,
    gradient_colors: ['#FF6B6B', '#4ECDC4'],
    section_bg_color: '#FFF5F5',
    primary_text_color: '#1A1A1A',
    secondary_text_color: '#888888',
    accent_color: '#FF6B6B'
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('video');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAllCelebrations();
  }, []);

  const fetchAllCelebrations = async () => {
    try {
      const response = await axios.get('http://31.97.206.144:4061/api/admin/allcelebrations');
      if (response.data.success) {
        const parsedData = response.data.data.map(celeb => {
          let colors = celeb.gradient_colors;
          if (typeof colors === 'string') {
            try {
              colors = JSON.parse(colors);
            } catch(e) {
              colors = ['#FF6B6B', '#4ECDC4'];
            }
          }
          if (Array.isArray(colors) && colors.length === 1 && typeof colors[0] === 'string' && colors[0].startsWith('[')) {
            try {
              colors = JSON.parse(colors[0]);
            } catch(e) {
              colors = ['#FF6B6B', '#4ECDC4'];
            }
          }
          return { ...celeb, gradient_colors: colors };
        });
        setCelebrations(parsedData);
      }
    } catch (err) {
      console.error('Error fetching celebrations:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addGradientColor = () => {
    if (formData.gradient_colors.length < 5) {
      setFormData(prev => ({
        ...prev,
        gradient_colors: [...prev.gradient_colors, '#888888']
      }));
    } else {
      setError('Maximum 5 colors allowed');
    }
  };

  const removeGradientColor = (index) => {
    if (formData.gradient_colors.length > 2) {
      const newColors = [...formData.gradient_colors];
      newColors.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        gradient_colors: newColors
      }));
    } else {
      setError('Minimum 2 colors required');
    }
  };

  const updateGradientColor = (index, color) => {
    const newColors = [...formData.gradient_colors];
    newColors[index] = color;
    setFormData(prev => ({
      ...prev,
      gradient_colors: newColors
    }));
  };

  const moveGradientColor = (index, direction) => {
    const newColors = [...formData.gradient_colors];
    if (direction === 'up' && index > 0) {
      [newColors[index], newColors[index - 1]] = [newColors[index - 1], newColors[index]];
    } else if (direction === 'down' && index < newColors.length - 1) {
      [newColors[index], newColors[index + 1]] = [newColors[index + 1], newColors[index]];
    }
    setFormData(prev => ({
      ...prev,
      gradient_colors: newColors
    }));
  };

  const copyGradientColors = () => {
    const gradientString = formData.gradient_colors.join(', ');
    navigator.clipboard.writeText(gradientString);
    setSuccess('Gradient colors copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const randomGradient = () => {
    const randomColors = [
      ['#FF6B6B', '#4ECDC4'],
      ['#FFE66D', '#FF6B6B'],
      ['#A8E6CF', '#FFD3B5'],
      ['#FF9A8B', '#FF6A88'],
      ['#4158D0', '#C850C0'],
      ['#F09819', '#FF512F'],
      ['#1A2980', '#26D0CE'],
      ['#A770EF', '#FDB99B'],
      ['#FFB88C', '#DE6262'],
      ['#00F260', '#0575E6']
    ];
    const random = randomColors[Math.floor(Math.random() * randomColors.length)];
    setFormData(prev => ({
      ...prev,
      gradient_colors: random
    }));
  };

  const getGradientStyle = (colors) => {
    if (!colors || colors.length < 2) return 'linear-gradient(135deg, #FF6B6B, #4ECDC4)';
    const colorStops = colors.map((color, index) => {
      const percent = (index / (colors.length - 1)) * 100;
      return `${color} ${percent}%`;
    }).join(', ');
    return `linear-gradient(${gradientAngle}deg, ${colorStops})`;
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      const maxSize = 50 * 1024 * 1024;
      
      if (file.size > maxSize) {
        setError('File size should be less than 50MB');
        return;
      }

      if (fileType.startsWith('video/')) {
        setMediaType('video');
      } else if (fileType === 'image/gif') {
        setMediaType('gif');
      } else {
        setError('Please upload a video (MP4, MOV, AVI) or GIF file');
        return;
      }

      setMediaFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
      setError('');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('enabled', formData.enabled);
    data.append('duration_seconds', formData.duration_seconds);
    data.append('loop', formData.loop);
    data.append('gradient_colors', JSON.stringify(formData.gradient_colors));
    data.append('section_bg_color', formData.section_bg_color);
    data.append('primary_text_color', formData.primary_text_color);
    data.append('secondary_text_color', formData.secondary_text_color);
    data.append('accent_color', formData.accent_color);
    
    if (mediaFile) {
      data.append('video', mediaFile);
    }

    try {
      const response = await axios.post(
        'http://31.97.206.144:4061/api/admin/createcelebration',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setSuccess('Celebration created successfully!');
        resetForm();
        fetchAllCelebrations();
        setActiveTab('list');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating celebration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('enabled', formData.enabled);
    data.append('duration_seconds', formData.duration_seconds);
    data.append('loop', formData.loop);
    data.append('gradient_colors', JSON.stringify(formData.gradient_colors));
    data.append('section_bg_color', formData.section_bg_color);
    data.append('primary_text_color', formData.primary_text_color);
    data.append('secondary_text_color', formData.secondary_text_color);
    data.append('accent_color', formData.accent_color);
    
    if (mediaFile) {
      data.append('video', mediaFile);
    }

    try {
      const response = await axios.put(
        `http://31.97.206.144:4061/api/admin/updatecelebration/${editingId}`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setSuccess('Celebration updated successfully!');
        resetForm();
        fetchAllCelebrations();
        setActiveTab('list');
        setEditingId(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating celebration');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this celebration?')) return;
    
    setLoading(true);
    try {
      const response = await axios.delete(`http://31.97.206.144:4061/api/admin/deletecelebration/${id}`);
      if (response.data.success) {
        setSuccess('Celebration deleted successfully!');
        fetchAllCelebrations();
        if (editingId === id) resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting celebration');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (celebration) => {
    let gradientColors = celebration.gradient_colors || ['#FF6B6B', '#4ECDC4'];
    
    if (typeof gradientColors === 'string') {
      try {
        gradientColors = JSON.parse(gradientColors);
      } catch(e) {
        gradientColors = ['#FF6B6B', '#4ECDC4'];
      }
    }
    
    if (Array.isArray(gradientColors) && gradientColors.length === 1 && typeof gradientColors[0] === 'string' && gradientColors[0].startsWith('[')) {
      try {
        gradientColors = JSON.parse(gradientColors[0]);
      } catch(e) {
        gradientColors = ['#FF6B6B', '#4ECDC4'];
      }
    }
    
    setFormData({
      enabled: celebration.enabled,
      video_url: celebration.video_url || '',
      duration_seconds: celebration.duration_seconds,
      loop: celebration.loop,
      gradient_colors: gradientColors,
      section_bg_color: celebration.section_bg_color,
      primary_text_color: celebration.primary_text_color,
      secondary_text_color: celebration.secondary_text_color,
      accent_color: celebration.accent_color
    });
    setMediaPreview(celebration.video_url);
    const url = celebration.video_url || '';
    if (url.match(/\.(mp4|mov|avi|webm)$/i)) {
      setMediaType('video');
    } else if (url.match(/\.(gif)$/i)) {
      setMediaType('gif');
    }
    setEditingId(celebration._id);
    setActiveTab('create');
    setMediaFile(null);
  };

  const resetForm = () => {
    setFormData({
      enabled: true,
      video_url: '',
      duration_seconds: 5,
      loop: true,
      gradient_colors: ['#FF6B6B', '#4ECDC4'],
      section_bg_color: '#FFF5F5',
      primary_text_color: '#1A1A1A',
      secondary_text_color: '#888888',
      accent_color: '#FF6B6B'
    });
    setMediaFile(null);
    setMediaPreview(null);
    setEditingId(null);
    setError('');
    setSuccess('');
    setGradientAngle(135);
  };

  const fetchActiveCelebration = async () => {
    try {
      const response = await axios.get('http://31.97.206.144:4061/api/admin/getactivecelebration');
      if (response.data) {
        let activeData = response.data;
        let colors = activeData.gradient_colors;
        if (typeof colors === 'string') {
          try {
            colors = JSON.parse(colors);
          } catch(e) {
            colors = ['#FF6B6B', '#4ECDC4'];
          }
        }
        if (Array.isArray(colors) && colors.length === 1 && typeof colors[0] === 'string' && colors[0].startsWith('[')) {
          try {
            colors = JSON.parse(colors[0]);
          } catch(e) {
            colors = ['#FF6B6B', '#4ECDC4'];
          }
        }
        activeData.gradient_colors = colors;
        setSelectedPreview(activeData);
        setPreviewModal(true);
      }
    } catch (err) {
      console.error('Error fetching active celebration:', err);
    }
  };

  const handleViewDetails = (celebration) => {
    setSelectedCelebration(celebration);
    setViewModal(true);
  };

  const renderMediaPreview = (mediaUrl, isLive = false, loop = true) => {
    if (!mediaUrl) return null;
    
    const isGif = mediaUrl.toLowerCase().match(/\.(gif)$/i);
    
    if (isGif) {
      return (
        <img 
          src={mediaUrl} 
          alt="Celebration GIF"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '350px', 
            borderRadius: '12px',
            marginBottom: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            objectFit: 'contain'
          }}
        />
      );
    } else {
      return (
        <video 
          src={mediaUrl} 
          autoPlay={isLive ? loop : false}
          loop={isLive ? loop : false}
          controls={!isLive}
          muted={isLive}
          style={{ 
            maxWidth: '100%', 
            maxHeight: '350px', 
            borderRadius: '12px',
            marginBottom: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
      );
    }
  };

  const renderCelebrationCard = (celebration, isPreview = false) => {
    let colors = celebration.gradient_colors || ['#FF6B6B', '#4ECDC4'];
    if (typeof colors === 'string') {
      try {
        colors = JSON.parse(colors);
      } catch(e) {
        colors = ['#FF6B6B', '#4ECDC4'];
      }
    }
    if (Array.isArray(colors) && colors.length === 1 && typeof colors[0] === 'string' && colors[0].startsWith('[')) {
      try {
        colors = JSON.parse(colors[0]);
      } catch(e) {
        colors = ['#FF6B6B', '#4ECDC4'];
      }
    }
    const gradient = getGradientStyle(colors);
    
    return (
      <div 
        style={{
          background: gradient,
          padding: '40px 20px',
          borderRadius: '20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.3s ease'
        }}
      >
        {celebration.video_url && renderMediaPreview(celebration.video_url, isPreview, celebration.loop)}
      </div>
    );
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Row>
        <Col lg={12}>
          <Card className="shadow-lg border-0">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <CardTitle tag="h2" className="text-primary mb-0">
                    <FaGift className="me-2" />
                    Celebration Manager
                  </CardTitle>
                  <p className="text-muted mb-0 mt-2">Upload video/GIF and customize gradient colors</p>
                </div>
                <div className="d-flex gap-2">
                  <Button color="info" onClick={fetchActiveCelebration}>
                    <FaEye className="me-2" />
                    Preview Active
                  </Button>
                  <Button 
                    color={activeTab === 'create' ? 'primary' : 'outline-primary'} 
                    onClick={() => { setActiveTab('create'); resetForm(); }}
                  >
                    <FaPlus className="me-2" />
                    {editingId ? 'Edit Celebration' : 'Create New'}
                  </Button>
                  <Button 
                    color={activeTab === 'list' ? 'primary' : 'outline-primary'} 
                    onClick={() => setActiveTab('list')}
                  >
                    List All ({celebrations.length})
                  </Button>
                </div>
              </div>

              {error && (
                <Alert color="danger" toggle={() => setError('')} className="mb-3">
                  <FaTimes className="me-2" />
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert color="success" toggle={() => setSuccess('')} className="mb-3">
                  <FaCheck className="me-2" />
                  {success}
                </Alert>
              )}

              {activeTab === 'create' && (
                <Form onSubmit={editingId ? handleUpdate : handleCreate}>
                  <Row>
                    <Col md={6}>
                      <Card className="mb-4 border-0 shadow-sm">
                        <CardBody>
                          <h5 className="mb-3">
                            <FaVideo className="me-2 text-primary" />
                            Media Settings
                          </h5>
                          
                          <FormGroup switch className="mb-3">
                            <Label check>
                              <Input 
                                type="switch" 
                                name="enabled"
                                checked={formData.enabled}
                                onChange={handleChange}
                              />
                              Enable Celebration (Active/Inactive)
                            </Label>
                          </FormGroup>

                          <FormGroup>
                            <Label className="fw-bold">
                              <FaUpload className="me-2" />
                              Upload Media (Video or GIF)
                            </Label>
                            <div 
                              className="border rounded p-4 text-center cursor-pointer"
                              onClick={() => fileInputRef.current.click()}
                              style={{ 
                                cursor: 'pointer', 
                                backgroundColor: '#f8f9fa',
                                border: '2px dashed #dee2e6',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {mediaPreview ? (
                                <>
                                  {mediaType === 'video' ? (
                                    <video 
                                      src={mediaPreview} 
                                      style={{ maxHeight: '150px', width: '100%', borderRadius: '8px' }}
                                      controls
                                    />
                                  ) : (
                                    <img 
                                      src={mediaPreview} 
                                      alt="Preview" 
                                      style={{ maxHeight: '150px', width: '100%', objectFit: 'contain', borderRadius: '8px' }}
                                    />
                                  )}
                                  <p className="mt-2 mb-0 text-success">
                                    <FaCheck className="me-1" />
                                    {mediaType === 'video' ? 'Video uploaded' : 'GIF uploaded'}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <FaFileVideo size={48} className="text-muted mb-2" />
                                  <FaFileImage size={48} className="text-muted mb-2 ms-2" />
                                  <p className="mt-2 mb-0">Click to upload video (MP4, MOV) or GIF</p>
                                  <small className="text-muted">Max size: 50MB</small>
                                </>
                              )}
                            </div>
                            <input 
                              ref={fileInputRef}
                              type="file"
                              hidden
                              accept="video/*,image/gif"
                              onChange={handleMediaChange}
                            />
                          </FormGroup>

                          <Row>
                            <Col md={6}>
                              <FormGroup>
                                <Label>Duration (seconds)</Label>
                                <Input
                                  type="number"
                                  name="duration_seconds"
                                  value={formData.duration_seconds}
                                  onChange={handleChange}
                                  min="1"
                                  max="30"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup switch>
                                <Label check>
                                  <Input 
                                    type="switch" 
                                    name="loop"
                                    checked={formData.loop}
                                    onChange={handleChange}
                                  />
                                  Loop Media
                                </Label>
                              </FormGroup>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>

                      <Card className="border-0 shadow-sm">
                        <CardBody>
                          <h5 className="mb-3">
                            <FaPalette className="me-2 text-primary" />
                            Color Settings
                          </h5>
                          
                          <FormGroup>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <Label className="fw-bold">Gradient Colors</Label>
                              <div className="d-flex gap-2">
                                <Button size="sm" color="secondary" onClick={randomGradient} title="Random Gradient">
                                  <FaRandom />
                                </Button>
                                <Button size="sm" color="info" onClick={copyGradientColors} title="Copy Colors">
                                  <FaCopy />
                                </Button>
                                <Button size="sm" color="primary" onClick={addGradientColor} disabled={formData.gradient_colors.length >= 5}>
                                  <FaPlus /> Add Color
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <Label>Gradient Angle: {gradientAngle}°</Label>
                              <Input
                                type="range"
                                min="0"
                                max="360"
                                value={gradientAngle}
                                onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                            
                            {formData.gradient_colors.map((color, index) => (
                              <div key={index} className="d-flex align-items-center gap-2 mb-2">
                                <div className="d-flex align-items-center gap-2 flex-grow-1">
                                  <Input
                                    type="color"
                                    value={color}
                                    onChange={(e) => updateGradientColor(index, e.target.value)}
                                    style={{ width: '50px', height: '38px' }}
                                  />
                                  <Input
                                    type="text"
                                    value={color}
                                    onChange={(e) => updateGradientColor(index, e.target.value)}
                                    placeholder="#RRGGBB"
                                  />
                                </div>
                                <div className="d-flex gap-1">
                                  <Button
                                    size="sm"
                                    color="light"
                                    onClick={() => moveGradientColor(index, 'up')}
                                    disabled={index === 0}
                                  >
                                    <FaArrowUp />
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="light"
                                    onClick={() => moveGradientColor(index, 'down')}
                                    disabled={index === formData.gradient_colors.length - 1}
                                  >
                                    <FaArrowDown />
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="danger"
                                    onClick={() => removeGradientColor(index)}
                                    disabled={formData.gradient_colors.length <= 2}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            <div 
                              style={{ 
                                width: '100%', 
                                height: '60px', 
                                background: getGradientStyle(formData.gradient_colors),
                                borderRadius: '8px',
                                marginTop: '12px',
                                border: '1px solid #ddd'
                              }} 
                            />
                          </FormGroup>

                          <Row className="mt-3">
                            <Col md={6}>
                              <FormGroup>
                                <Label>Section Background Color</Label>
                                <div className="d-flex align-items-center gap-2">
                                  <Input
                                    type="color"
                                    name="section_bg_color"
                                    value={formData.section_bg_color}
                                    onChange={handleChange}
                                    style={{ width: '60px', height: '40px' }}
                                  />
                                  <Input
                                    type="text"
                                    value={formData.section_bg_color}
                                    onChange={handleChange}
                                    name="section_bg_color"
                                  />
                                </div>
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup>
                                <Label>Accent Color</Label>
                                <div className="d-flex align-items-center gap-2">
                                  <Input
                                    type="color"
                                    name="accent_color"
                                    value={formData.accent_color}
                                    onChange={handleChange}
                                    style={{ width: '60px', height: '40px' }}
                                  />
                                  <Input
                                    type="text"
                                    value={formData.accent_color}
                                    onChange={handleChange}
                                    name="accent_color"
                                  />
                                </div>
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <FormGroup>
                                <Label>Primary Text Color</Label>
                                <div className="d-flex align-items-center gap-2">
                                  <Input
                                    type="color"
                                    name="primary_text_color"
                                    value={formData.primary_text_color}
                                    onChange={handleChange}
                                    style={{ width: '60px', height: '40px' }}
                                  />
                                  <Input
                                    type="text"
                                    value={formData.primary_text_color}
                                    onChange={handleChange}
                                    name="primary_text_color"
                                  />
                                </div>
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup>
                                <Label>Secondary Text Color</Label>
                                <div className="d-flex align-items-center gap-2">
                                  <Input
                                    type="color"
                                    name="secondary_text_color"
                                    value={formData.secondary_text_color}
                                    onChange={handleChange}
                                    style={{ width: '60px', height: '40px' }}
                                  />
                                  <Input
                                    type="text"
                                    value={formData.secondary_text_color}
                                    onChange={handleChange}
                                    name="secondary_text_color"
                                  />
                                </div>
                              </FormGroup>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="mt-4 border-0 shadow-sm">
                        <CardBody>
                          <h5 className="mb-3">
                            <FaEye className="me-2 text-primary" />
                            Live Preview
                          </h5>
                          {renderCelebrationCard(formData, true)}
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-4">
                    <Button 
                      color="primary" 
                      type="submit" 
                      disabled={loading}
                      size="lg"
                      className="px-5"
                    >
                      {loading ? <Spinner size="sm" className="me-2" /> : <FaSave className="me-2" />}
                      {editingId ? 'Update Celebration' : 'Create Celebration'}
                    </Button>
                    {editingId && (
                      <Button color="secondary" onClick={resetForm} size="lg">
                        <FaTimes className="me-2" />
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </Form>
              )}

              {activeTab === 'list' && (
                <>
                  {celebrations.length === 0 ? (
                    <Alert color="info" className="text-center py-5">
                      <FaGift size={48} className="mb-3" />
                      <h5>No celebrations found</h5>
                      <p>Create your first celebration to get started!</p>
                      <Button color="primary" onClick={() => setActiveTab('create')}>
                        <FaPlus className="me-2" />
                        Create Celebration
                      </Button>
                    </Alert>
                  ) : (
                    <Table responsive hover className="mt-3">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Media</th>
                          <th>Status</th>
                          <th>Duration</th>
                          <th>Loop</th>
                          <th>Gradient Colors</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {celebrations.map((celeb, index) => {
                          const isGif = celeb.video_url?.toLowerCase().match(/\.(gif)$/i);
                          let gradientColors = celeb.gradient_colors || ['#FF6B6B', '#4ECDC4'];
                          if (typeof gradientColors === 'string') {
                            try {
                              gradientColors = JSON.parse(gradientColors);
                            } catch(e) {
                              gradientColors = ['#FF6B6B', '#4ECDC4'];
                            }
                          }
                          if (Array.isArray(gradientColors) && gradientColors.length === 1 && typeof gradientColors[0] === 'string' && gradientColors[0].startsWith('[')) {
                            try {
                              gradientColors = JSON.parse(gradientColors[0]);
                            } catch(e) {
                              gradientColors = ['#FF6B6B', '#4ECDC4'];
                            }
                          }
                          const gradient = `linear-gradient(135deg, ${gradientColors.join(', ')})`;
                          
                          return (
                            <tr key={celeb._id}>
                              <td>{index + 1}</td>
                              <td>
                                {celeb.video_url ? (
                                  isGif ? (
                                    <img 
                                      src={celeb.video_url} 
                                      alt="Celebration" 
                                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                  ) : (
                                    <video 
                                      src={celeb.video_url} 
                                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                      onMouseEnter={e => e.target.play()}
                                      onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                  )
                                ) : (
                                  <Badge color="warning">No Media</Badge>
                                )}
                              </td>
                              <td>
                                <Badge color={celeb.enabled ? 'success' : 'danger'}>
                                  {celeb.enabled ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td>{celeb.duration_seconds}s</td>
                              <td>{celeb.loop ? 'Yes' : 'No'}</td>
                              <td>
                                <div 
                                  style={{ 
                                    width: '80px', 
                                    height: '30px', 
                                    background: gradient,
                                    borderRadius: '4px',
                                    border: '1px solid #ddd'
                                  }} 
                                />
                              </td>
                              <td>{new Date(celeb.createdAt).toLocaleDateString()}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button 
                                    color="info" 
                                    size="sm"
                                    onClick={() => handleViewDetails(celeb)}
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </Button>
                                  <Button 
                                    color="warning" 
                                    size="sm"
                                    onClick={() => handleEdit(celeb)}
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button 
                                    color="danger" 
                                    size="sm"
                                    onClick={() => handleDelete(celeb._id)}
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal for Active Celebration */}
      <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setPreviewModal(false)}>
          <FaEye className="me-2" />
          Active Celebration Preview
        </ModalHeader>
        <ModalBody>
          {selectedPreview && renderCelebrationCard(selectedPreview, true)}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={viewModal} toggle={() => setViewModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setViewModal(false)}>
          <FaInfoCircle className="me-2" />
          Celebration Details
        </ModalHeader>
        <ModalBody>
          {selectedCelebration && (
            <div>
              {/* Media Preview */}
              <div className="mb-4">
                <h6 className="mb-2">Media Preview</h6>
                <div style={{ 
                  background: '#f8f9fa', 
                  borderRadius: '12px', 
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  {selectedCelebration.video_url ? (
                    selectedCelebration.video_url.toLowerCase().match(/\.(gif)$/i) ? (
                      <img 
                        src={selectedCelebration.video_url} 
                        alt="Celebration" 
                        style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px' }}
                      />
                    ) : (
                      <video 
                        src={selectedCelebration.video_url} 
                        controls
                        autoPlay={selectedCelebration.loop}
                        loop={selectedCelebration.loop}
                        style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px' }}
                      />
                    )
                  ) : (
                    <p className="text-muted">No media uploaded</p>
                  )}
                </div>
              </div>

              {/* Details */}
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Status:</strong>
                    <Badge color={selectedCelebration.enabled ? 'success' : 'danger'} className="ms-2">
                      {selectedCelebration.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <strong>Duration:</strong> {selectedCelebration.duration_seconds} seconds
                  </div>
                  <div className="mb-3">
                    <strong>Loop:</strong> {selectedCelebration.loop ? 'Yes' : 'No'}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Created At:</strong><br />
                    {new Date(selectedCelebration.createdAt).toLocaleString()}
                  </div>
                  <div className="mb-3">
                    <strong>Last Updated:</strong><br />
                    {new Date(selectedCelebration.updatedAt).toLocaleString()}
                  </div>
                </Col>
              </Row>

              {/* Gradient Colors */}
              <div className="mb-3">
                <strong>Gradient Colors:</strong>
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {(() => {
                    let colors = selectedCelebration.gradient_colors || ['#FF6B6B', '#4ECDC4'];
                    if (typeof colors === 'string') {
                      try {
                        colors = JSON.parse(colors);
                      } catch(e) {
                        colors = ['#FF6B6B', '#4ECDC4'];
                      }
                    }
                    if (Array.isArray(colors) && colors.length === 1 && typeof colors[0] === 'string' && colors[0].startsWith('[')) {
                      try {
                        colors = JSON.parse(colors[0]);
                      } catch(e) {
                        colors = ['#FF6B6B', '#4ECDC4'];
                      }
                    }
                    return colors.map((color, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2">
                        <div style={{ width: '40px', height: '40px', backgroundColor: color, borderRadius: '8px', border: '1px solid #ddd' }} />
                        <span>{color}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Color Settings */}
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Section BG Color:</strong>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div style={{ width: '40px', height: '40px', backgroundColor: selectedCelebration.section_bg_color, borderRadius: '8px', border: '1px solid #ddd' }} />
                      <span>{selectedCelebration.section_bg_color}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Accent Color:</strong>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div style={{ width: '40px', height: '40px', backgroundColor: selectedCelebration.accent_color, borderRadius: '8px', border: '1px solid #ddd' }} />
                      <span>{selectedCelebration.accent_color}</span>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Primary Text Color:</strong>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div style={{ width: '40px', height: '40px', backgroundColor: selectedCelebration.primary_text_color, borderRadius: '8px', border: '1px solid #ddd' }} />
                      <span>{selectedCelebration.primary_text_color}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Secondary Text Color:</strong>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div style={{ width: '40px', height: '40px', backgroundColor: selectedCelebration.secondary_text_color, borderRadius: '8px', border: '1px solid #ddd' }} />
                      <span>{selectedCelebration.secondary_text_color}</span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Full Preview */}
              <div className="mt-3">
                <strong>Full Preview:</strong>
                <div className="mt-2">
                  {renderCelebrationCard(selectedCelebration, true)}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => {
            if (selectedCelebration) handleEdit(selectedCelebration);
            setViewModal(false);
          }}>
            <FaEdit /> Edit
          </Button>
          <Button color="secondary" onClick={() => setViewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <style jsx>{`
        .hover-shadow {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
        .transition {
          transition: all 0.3s ease;
        }
      `}</style>
    </Container>
  );
};

export default CelebrationManager;
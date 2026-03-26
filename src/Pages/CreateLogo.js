import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle,
  Alert,
  Row,
  Col
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCloudUploadAlt, 
  FaImage, 
  FaTimes, 
  FaSpinner, 
  FaPlus, 
  FaTrash,
  FaEye,
  FaSave,
  FaMousePointer,
  FaDownload
} from 'react-icons/fa';

const CreateLogo = () => {
  const [logoName, setLogoName] = useState('EditEzy');
  const [logoCategoryId, setLogoCategoryId] = useState('');
  const [logoImage, setLogoImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [placeholders, setPlaceholders] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Fetch logo categories
  useEffect(() => {
    fetchLogoCategories();
  }, []);

  useEffect(() => {
    if (previewImage) {
      drawPreviewWithPlaceholders(false);
    }
  }, [previewImage, placeholders]);

  const fetchLogoCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axios.get('http://31.97.206.144:4061/api/admin/getlogocategories');
      console.log('Categories response:', response.data);
      
      // Handle different response structures
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
      setErrorMessage('Failed to load logo categories');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Only JPG, PNG, GIF, SVG, and WEBP images are allowed');
        return;
      }
      
      setLogoImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setErrorMessage('');
    }
  };

  const drawPreviewWithPlaceholders = (showBorder = false) => {
    if (!canvasRef.current || !previewImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      placeholders.forEach(placeholder => {
        const { position, style, text, id } = placeholder;
        
        ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        ctx.textAlign = style.textAlign;
        
        if (style.backgroundColor && style.backgroundColor !== 'transparent') {
          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = style.fontSize;
          
          ctx.fillStyle = style.backgroundColor;
          ctx.fillRect(
            position.x - (style.textAlign === 'center' ? textWidth / 2 : 0),
            position.y - textHeight / 2,
            textWidth,
            textHeight
          );
          ctx.fillStyle = style.color;
        }
        
        ctx.fillText(text, position.x, position.y);
        
        if (showBorder && selectedPlaceholderId === id) {
          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = style.fontSize;
          
          ctx.strokeStyle = '#007bff';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            position.x - (style.textAlign === 'center' ? textWidth / 2 : 0) - 5,
            position.y - textHeight / 2 - 5,
            textWidth + 10,
            textHeight + 10
          );
          ctx.setLineDash([]);
        }
      });
    };
    
    img.src = previewImage;
  };

  const drawImageForSave = (callback) => {
    if (!previewImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      placeholders.forEach(placeholder => {
        const { position, style, text } = placeholder;
        
        ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        ctx.textAlign = style.textAlign;
        
        if (style.backgroundColor && style.backgroundColor !== 'transparent') {
          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = style.fontSize;
          
          ctx.fillStyle = style.backgroundColor;
          ctx.fillRect(
            position.x - (style.textAlign === 'center' ? textWidth / 2 : 0),
            position.y - textHeight / 2,
            textWidth,
            textHeight
          );
          ctx.fillStyle = style.color;
        }
        
        ctx.fillText(text, position.x, position.y);
      });
      
      if (callback) callback(canvas);
    };
    
    img.src = previewImage;
  };

  const capturePreviewImage = () => {
    return new Promise((resolve) => {
      drawImageForSave((canvas) => {
        resolve(canvas.toDataURL('image/png'));
      });
    });
  };

  const downloadPreview = async () => {
    drawImageForSave((canvas) => {
      const link = document.createElement('a');
      link.download = `${logoName || 'logo'}_preview.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handleCanvasMouseDown = (e) => {
    if (!canvasRef.current || placeholders.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    for (let i = placeholders.length - 1; i >= 0; i--) {
      const placeholder = placeholders[i];
      const { position, style, text } = placeholder;
      
      const canvas_temp = document.createElement('canvas');
      const ctx_temp = canvas_temp.getContext('2d');
      ctx_temp.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
      const metrics = ctx_temp.measureText(text);
      const textWidth = metrics.width;
      const textHeight = style.fontSize;
      
      const boxX = position.x - (style.textAlign === 'center' ? textWidth / 2 : 0);
      const boxY = position.y - textHeight / 2;
      
      if (mouseX >= boxX - 10 && mouseX <= boxX + textWidth + 10 &&
          mouseY >= boxY - 10 && mouseY <= boxY + textHeight + 10) {
        setSelectedPlaceholderId(placeholder.id);
        setIsDragging(true);
        setDragStart({ x: mouseX - position.x, y: mouseY - position.y });
        break;
      }
    }
  };
  
  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !selectedPlaceholderId) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const newX = mouseX - dragStart.x;
    const newY = mouseY - dragStart.y;
    
    setPlaceholders(placeholders.map(p => 
      p.id === selectedPlaceholderId 
        ? { ...p, position: { ...p.position, x: newX, y: newY } }
        : p
    ));
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const addPlaceholder = () => {
    const newPlaceholder = {
      id: Date.now().toString(),
      text: "EditEzy",
      type: "text",
      label: "Business Name",
      defaultValue: "EditEzy",
      position: {
        x: canvasRef.current ? canvasRef.current.width / 2 : 200,
        y: canvasRef.current ? canvasRef.current.height / 2 : 200,
        width: 400,
        height: 80
      },
      style: {
        fontSize: 24,
        fontFamily: "Poppins",
        fontWeight: "bold",
        color: "#000000",
        textAlign: "center",
        backgroundColor: "transparent"
      },
      required: true,
      maxLength: 50
    };
    
    setPlaceholders([...placeholders, newPlaceholder]);
    setSelectedPlaceholderId(newPlaceholder.id);
  };

  const removePlaceholder = (id) => {
    setPlaceholders(placeholders.filter(p => p.id !== id));
    if (selectedPlaceholderId === id) {
      setSelectedPlaceholderId(null);
    }
  };

  const updatePlaceholderStyle = (id, updates) => {
    setPlaceholders(placeholders.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoCategoryId) {
      setErrorMessage('Please select a logo category.');
      return;
    }

    if (!logoImage) {
      setErrorMessage('Logo image is required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const previewImageBase64 = await capturePreviewImage();

    const formData = new FormData();
    formData.append('name', "EditEzy");
    formData.append('logoCategoryId', logoCategoryId);
    formData.append('image', logoImage);
    formData.append('previewImageData', previewImageBase64);
    formData.append('placeholders', JSON.stringify(placeholders));

    try {
      const response = await axios.post(
        'http://31.97.206.144:4061/api/admin/createlogo',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setSuccessMessage('Logo created successfully!');
      
      setLogoCategoryId('');
      setLogoImage(null);
      setPreviewImage(null);
      setPlaceholders([]);
      setShowPreview(false);
      setSelectedPlaceholderId(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        navigate('/logolist');
      }, 2000);

    } catch (error) {
      console.error('Error creating logo:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Error creating logo. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setLogoImage(null);
    setPreviewImage(null);
    setPlaceholders([]);
    setSelectedPlaceholderId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openPreview = () => {
    if (!logoCategoryId) {
      setErrorMessage('Please select a category to preview');
      return;
    }
    if (!logoImage) {
      setErrorMessage('Please upload an image to preview');
      return;
    }
    if (placeholders.length === 0) {
      addPlaceholder();
    }
    setShowPreview(true);
  };

  useEffect(() => {
    if (previewImage) {
      drawPreviewWithPlaceholders(true);
    }
  }, [selectedPlaceholderId]);

  // Get category display name safely
  const getCategoryName = (category) => {
    return category.name || category.categoryName || 'Unnamed';
  };

  return (
    <Container className="my-5">
      <Row>
        <Col md={6}>
          <Card className="shadow-lg border-0">
            <CardBody className="p-4">
              <CardTitle tag="h3" className="text-center text-primary mb-4">
                <FaImage className="me-2" />
                Create New Logo
              </CardTitle>

              {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
              {successMessage && <Alert color="success">{successMessage}</Alert>}

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label className="fw-bold">Logo Name <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    value="EditEzy"
                    disabled={true}
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                  />
                  <small className="text-muted">Logo name is fixed as "EditEzy"</small>
                </FormGroup>

                <FormGroup>
                  <Label className="fw-bold">Category <span className="text-danger">*</span></Label>
                  {categoriesLoading ? (
                    <div className="text-center py-3">
                      <FaSpinner className="spinner-border text-primary me-2" />
                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <Alert color="warning">
                      No categories found. Please create a category first.
                    </Alert>
                  ) : (
                    <Input
                      type="select"
                      value={logoCategoryId}
                      onChange={(e) => setLogoCategoryId(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">-- Select a Category --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {getCategoryName(cat)}
                        </option>
                      ))}
                    </Input>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label className="fw-bold">
                    Text Overlays 
                    <small className="text-muted ms-2">
                      <FaMousePointer className="me-1" /> Click and drag on preview to move
                    </small>
                  </Label>
                  <Button
                    type="button"
                    color="primary"
                    size="sm"
                    onClick={addPlaceholder}
                    disabled={loading || !previewImage}
                    className="mb-2"
                  >
                    <FaPlus /> Add Text Overlay
                  </Button>
                  
                  {placeholders.map((placeholder) => (
                    <Card 
                      key={placeholder.id} 
                      className={`mb-2 ${selectedPlaceholderId === placeholder.id ? 'border-primary' : 'bg-light'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedPlaceholderId(placeholder.id)}
                    >
                      <CardBody className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>EditEzy</strong>
                          <Button
                            type="button"
                            color="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePlaceholder(placeholder.id);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                        
                        {selectedPlaceholderId === placeholder.id && (
                          <>
                            <FormGroup className="mt-2">
                              <Label className="small">Text Content</Label>
                              <Input
                                type="text"
                                size="sm"
                                value="EditEzy"
                                disabled={true}
                                style={{ backgroundColor: '#f0f0f0' }}
                              />
                              <small className="text-muted">Text is fixed as "EditEzy"</small>
                            </FormGroup>
                            
                            <Row className="mt-2">
                              <Col xs={6}>
                                <Label className="small">Font Size</Label>
                                <Input
                                  type="number"
                                  size="sm"
                                  value={placeholder.style.fontSize}
                                  onChange={(e) => updatePlaceholderStyle(placeholder.id, {
                                    style: { ...placeholder.style, fontSize: parseInt(e.target.value) }
                                  })}
                                />
                              </Col>
                              <Col xs={6}>
                                <Label className="small">Color</Label>
                                <Input
                                  type="color"
                                  value={placeholder.style.color}
                                  onChange={(e) => updatePlaceholderStyle(placeholder.id, {
                                    style: { ...placeholder.style, color: e.target.value }
                                  })}
                                />
                              </Col>
                            </Row>
                            
                            <Row className="mt-2">
                              <Col xs={6}>
                                <Label className="small">Font Weight</Label>
                                <Input
                                  type="select"
                                  size="sm"
                                  value={placeholder.style.fontWeight}
                                  onChange={(e) => updatePlaceholderStyle(placeholder.id, {
                                    style: { ...placeholder.style, fontWeight: e.target.value }
                                  })}
                                >
                                  <option value="normal">Normal</option>
                                  <option value="bold">Bold</option>
                                  <option value="bolder">Bolder</option>
                                  <option value="lighter">Lighter</option>
                                </Input>
                              </Col>
                              <Col xs={6}>
                                <Label className="small">Text Align</Label>
                                <Input
                                  type="select"
                                  size="sm"
                                  value={placeholder.style.textAlign}
                                  onChange={(e) => updatePlaceholderStyle(placeholder.id, {
                                    style: { ...placeholder.style, textAlign: e.target.value }
                                  })}
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </Input>
                              </Col>
                            </Row>
                            
                            <Row className="mt-2">
                              <Col xs={12}>
                                <Label className="small">Background Color</Label>
                                <div className="d-flex gap-2">
                                  <Input
                                    type="color"
                                    value={placeholder.style.backgroundColor === 'transparent' ? '#ffffff' : placeholder.style.backgroundColor}
                                    onChange={(e) => updatePlaceholderStyle(placeholder.id, {
                                      style: { ...placeholder.style, backgroundColor: e.target.value }
                                    })}
                                  />
                                  <Button
                                    size="sm"
                                    color="secondary"
                                    onClick={() => updatePlaceholderStyle(placeholder.id, {
                                      style: { ...placeholder.style, backgroundColor: 'transparent' }
                                    })}
                                  >
                                    Transparent
                                  </Button>
                                </div>
                              </Col>
                            </Row>
                          </>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </FormGroup>

                <FormGroup>
                  <Label className="fw-bold">Logo Image <span className="text-danger">*</span></Label>
                  
                  {previewImage ? (
                    <div className="border rounded p-3 text-center bg-light">
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                      <div className="mt-2">
                        <Button size="sm" color="danger" onClick={removeImage}>
                          <FaTimes /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border rounded p-5 text-center cursor-pointer"
                      onClick={triggerFileInput}
                      style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                    >
                      <FaCloudUploadAlt size={48} className="text-primary mb-2" />
                      <p>Click to upload image</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                    style={{ display: 'none' }}
                  />
                </FormGroup>

                <div className="d-flex justify-content-between mt-4">
                  <Button color="secondary" onClick={() => navigate('/logolist')} disabled={loading}>
                    Cancel
                  </Button>
                  <div className="d-flex gap-2">
                    {previewImage && placeholders.length > 0 && (
                      <Button
                        color="success"
                        onClick={downloadPreview}
                        disabled={loading}
                      >
                        <FaDownload /> Download Preview
                      </Button>
                    )}
                    <Button
                      color="info"
                      onClick={openPreview}
                      disabled={loading || !previewImage}
                    >
                      <FaEye /> Preview
                    </Button>
                    <Button color="primary" type="submit" disabled={loading}>
                      {loading ? <><FaSpinner className="spinner-border-sm me-1" /> Creating...</> : <><FaSave /> Create</>}
                    </Button>
                  </div>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-lg border-0">
            <CardBody className="p-4">
              <CardTitle tag="h4" className="text-center mb-3">
                Live Preview with Overlay
                <small className="d-block text-muted mt-1">
                  <FaMousePointer className="me-1" /> Click and drag text to move anywhere
                </small>
              </CardTitle>
              <div className="text-center border rounded p-3 bg-light">
                {previewImage ? (
                  <canvas
                    ref={canvasRef}
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      border: '1px solid #ddd',
                      cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                ) : (
                  <p className="text-muted">Upload an image to see preview with text overlays</p>
                )}
              </div>
              
              {placeholders.length > 0 && previewImage && (
                <div className="mt-3 text-muted small">
                  <p>💡 Tips:</p>
                  <ul className="mb-0">
                    <li>Text "EditEzy" is fixed and cannot be changed</li>
                    <li>Click on text to select it</li>
                    <li>Drag selected text to move anywhere on image</li>
                    <li>Adjust font, color, size from left panel when text is selected</li>
                    <li>Selected text shows blue dotted border (only in editor)</li>
                    <li>Downloaded/Saved images will NOT have the border</li>
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5>Final Preview with Text Overlay</h5>
                <Button className="btn-close btn-close-white" onClick={() => setShowPreview(false)} />
              </div>
              <div className="modal-body text-center">
                <canvas
                  ref={canvasRef}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
              <div className="modal-footer">
                <Button color="success" onClick={downloadPreview}>
                  <FaDownload /> Download
                </Button>
                <Button color="secondary" onClick={() => setShowPreview(false)}>
                  Edit
                </Button>
                <Button color="primary" onClick={async () => {
                  setShowPreview(false);
                  const form = document.querySelector('form');
                  const event = new Event('submit', { bubbles: true });
                  form.dispatchEvent(event);
                }}>
                  <FaSave /> Save Logo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CreateLogo;
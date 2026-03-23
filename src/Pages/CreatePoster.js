import React, { useState, useEffect, useRef } from 'react';
import {
  Form, FormGroup, Label, Input, Button, Row, Col, Card, CardBody, CardHeader
} from 'reactstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import html2canvas from 'html2canvas';

const imageShapes = ['rectangle', 'rounded', 'circle', 'ellipse'];

const CreatePoster = () => {
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [bgImage, setBgImage] = useState(null);
  const [bgImageURL, setBgImageURL] = useState(null);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [festivalDate, setFestivalDate] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [title, setTitle] = useState('');
  const [posterlang, setPosterlang] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const previewRef = useRef(null);

  const [overlaySettings, setOverlaySettings] = useState({
    overlays: [{ x: 100, y: 100, width: 200, height: 200, shape: 'rectangle', borderRadius: 0 }],
  });

  const [bgImageFilter, setBgImageFilter] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    blur: 0,
  });

  const [overlayImageFilters, setOverlayImageFilters] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!bgImage) {
      setBgImageURL(null);
      return;
    }
    const url = URL.createObjectURL(bgImage);
    setBgImageURL(url);
    return () => URL.revokeObjectURL(url);
  }, [bgImage]);

  useEffect(() => {
    axios
      .get('http://31.97.206.144:4061/api/category/getall-cateogry')
      .then((response) => {
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  useEffect(() => {
    setOverlayImageFilters((prevFilters) => {
      const newFilters = [...prevFilters];
      while (newFilters.length < images.length) {
        newFilters.push({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          grayscale: 0,
          blur: 0,
        });
      }
      return newFilters.slice(0, images.length);
    });
  }, [images]);

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(file);
  };

  const handleRemoveBgImage = () => {
    setBgImage(null);
  };

  const handleOverlayImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newPreviews]);
    setImageFiles((prevFiles) => [...prevFiles, ...files]);
    
    const newOverlays = [...overlaySettings.overlays];
    files.forEach(() => {
      newOverlays.push({ 
        x: 100, 
        y: 100, 
        width: 200, 
        height: 200,
        shape: 'rectangle',
        borderRadius: 0
      });
    });
    setOverlaySettings({ overlays: newOverlays });
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(images[index]);

    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    const newFilters = [...overlayImageFilters];
    const newOverlays = [...overlaySettings.overlays];

    newImages.splice(index, 1);
    newImageFiles.splice(index, 1);
    newFilters.splice(index, 1);
    newOverlays.splice(index, 1);

    setImages(newImages);
    setImageFiles(newImageFiles);
    setOverlayImageFilters(newFilters);
    setOverlaySettings({ overlays: newOverlays });
  };

  const handleBgImageFilterChange = (filterName, value) => {
    setBgImageFilter((prev) => ({
      ...prev,
      [filterName]: parseInt(value) || 0,
    }));
  };

  const handleOverlayImageFilterChange = (idx, filterName, value) => {
    setOverlayImageFilters((prev) => {
      const newFilters = [...prev];
      newFilters[idx] = {
        ...newFilters[idx],
        [filterName]: parseInt(value) || 0,
      };
      return newFilters;
    });
  };

  const handleMouseDown = (type, index, e) => {
    const rect = previewRef.current.getBoundingClientRect();
    let x, y;
    
    if (type === 'image') {
      x = overlaySettings.overlays[index].x;
      y = overlaySettings.overlays[index].y;
    }
    
    const scaleX = 450 / rect.width;
    const scaleY = 600 / rect.height;
    
    setDragOffset({
      x: e.clientX - rect.left - (x * scaleX),
      y: e.clientY - rect.top - (y * scaleY)
    });
    setDragging({ type, index });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = 450 / rect.width;
    const scaleY = 600 / rect.height;
    
    let x = (e.clientX - rect.left - dragOffset.x) / scaleX;
    let y = (e.clientY - rect.top - dragOffset.y) / scaleY;
    
    x = Math.max(0, Math.min(x, 450));
    y = Math.max(0, Math.min(y, 600));
    
    if (dragging.type === 'image') {
      const newOverlays = [...overlaySettings.overlays];
      newOverlays[dragging.index] = {
        ...newOverlays[dragging.index],
        x: x,
        y: y
      };
      setOverlaySettings({ overlays: newOverlays });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, dragOffset]);

  const SliderControl = ({ label, value, min, max, onChange, unit = '', step = 1 }) => (
    <FormGroup>
      <Label>
        {label}: {value}{unit}
      </Label>
      <Input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </FormGroup>
  );

  const getShapeStyles = (shape, borderRadius = 0) => {
    switch (shape) {
      case 'rounded':
        return { borderRadius: `${borderRadius}px` };
      case 'circle':
        return { borderRadius: '50%' };
      case 'ellipse':
        return { borderRadius: '50%' };
      default:
        return { borderRadius: '0' };
    }
  };

  const capturePosterImage = async () => {
    if (!previewRef.current) return null;
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: null
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    } catch (error) {
      console.error('Error capturing poster:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!name || !categoryName || !bgImage) {
      setErrorMessage('Please fill all required fields including background image.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const posterImage = await capturePosterImage();
      if (!posterImage) {
        throw new Error('Failed to generate poster image');
      }

      const posterData = {
        name,
        categoryName,
        festivalDate: festivalDate || undefined,
        description: description || undefined,
        tags: tags || undefined,
        title: title || undefined,
        posterlang: posterlang || undefined,
        designData: {
          bgImage: null,
          overlayImages: null,
          bgImageSettings: {
            filters: bgImageFilter,
          },
          overlaySettings,
          overlayImageFilters,
        },
      };

      const formData = new FormData();
      formData.append('posterImage', posterImage, 'poster.jpg');

      if (bgImage instanceof File) {
        formData.append('bgImage', bgImage, bgImage.name);
      }

      imageFiles.forEach((file) => {
        formData.append('overlayImages', file);
      });

      formData.append('name', name);
      formData.append('categoryName', categoryName);
      if (festivalDate) formData.append('festivalDate', festivalDate);
      if (description) formData.append('description', description);
      if (tags) formData.append('tags', tags);
      if (title) formData.append('title', title);
      if (posterlang) formData.append('posterlang', posterlang);
      formData.append('designData', JSON.stringify(posterData.designData));

      const response = await axios.post(
        'http://31.97.206.144:4061/api/poster/create-canvaposter',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        alert('Poster created successfully!');
        navigate('/posterlist');
      } else {
        throw new Error(response.data.message || 'Failed to create poster');
      }
    } catch (error) {
      console.error('Error creating poster:', error);
      setErrorMessage(error.message || 'Error creating poster. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-poster-container" style={{ maxWidth: '1400px', margin: 'auto', padding: '20px' }}>
      <h2 className="mb-4 text-center">Create New Poster</h2>
      
      <Row>
        <Col md={6}>
          {/* Poster Information Card */}
          <Card className="mb-4">
            <CardHeader className="bg-primary text-white">Poster Information</CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Poster Name <span className="text-danger">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Enter poster name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="categoryName">Category <span className="text-danger">*</span></Label>
                  <Input
                    id="categoryName"
                    type="select"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                    ))}
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label for="posterlang">Poster Language</Label>
                  <Input
                    id="posterlang"
                    placeholder="Enter poster language (e.g., English, Hindi, etc.)"
                    value={posterlang}
                    onChange={(e) => setPosterlang(e.target.value)}
                  />
                </FormGroup>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="festivalDate">Festival Date</Label>
                      <Input
                        id="festivalDate"
                        type="date"
                        value={festivalDate}
                        onChange={(e) => setFestivalDate(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Poster title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input
                    id="description"
                    type="textarea"
                    rows={3}
                    placeholder="Poster description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., festival, celebration, event"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </FormGroup>
              </Form>
            </CardBody>
          </Card>

          {/* Background Image Card */}
          <Card className="mb-4">
            <CardHeader className="bg-primary text-white">Background Image <span className="text-danger">*</span></CardHeader>
            <CardBody>
              <FormGroup>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageChange}
                />
                {bgImageURL && (
                  <div className="mt-3 position-relative">
                    <img
                      src={bgImageURL}
                      alt="Background Preview"
                      className="img-fluid rounded"
                      style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                    />
                    <Button
                      color="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={handleRemoveBgImage}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                )}
              </FormGroup>

              {bgImageURL && (
                <>
                  <h5 className="mt-3">Background Image Filters</h5>
                  <SliderControl
                    label="Brightness"
                    value={bgImageFilter.brightness}
                    min={0}
                    max={200}
                    onChange={(e) => handleBgImageFilterChange('brightness', e.target.value)}
                    unit="%"
                  />
                  <SliderControl
                    label="Contrast"
                    value={bgImageFilter.contrast}
                    min={0}
                    max={200}
                    onChange={(e) => handleBgImageFilterChange('contrast', e.target.value)}
                    unit="%"
                  />
                  <SliderControl
                    label="Saturation"
                    value={bgImageFilter.saturation}
                    min={0}
                    max={200}
                    onChange={(e) => handleBgImageFilterChange('saturation', e.target.value)}
                    unit="%"
                  />
                  <SliderControl
                    label="Grayscale"
                    value={bgImageFilter.grayscale}
                    min={0}
                    max={100}
                    onChange={(e) => handleBgImageFilterChange('grayscale', e.target.value)}
                    unit="%"
                  />
                  <SliderControl
                    label="Blur"
                    value={bgImageFilter.blur}
                    min={0}
                    max={10}
                    onChange={(e) => handleBgImageFilterChange('blur', e.target.value)}
                    unit="px"
                  />
                </>
              )}
            </CardBody>
          </Card>

          {/* Overlay Images Card */}
          <Card className="mb-4">
            <CardHeader className="bg-primary text-white">Overlay Images</CardHeader>
            <CardBody>
              <FormGroup>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleOverlayImagesChange}
                />
              </FormGroup>

              {images.length > 0 && (
                <div className="mt-3">
                  <h5>Overlay Images ({images.length})</h5>
                  {images.map((imgSrc, idx) => (
                    <Card key={idx} className="mb-3">
                      <CardBody>
                        <div className="position-relative">
                          <img
                            src={imgSrc}
                            alt={`Overlay ${idx + 1}`}
                            className="img-fluid rounded"
                            style={{
                              maxHeight: '150px',
                              width: '100%',
                              objectFit: 'cover',
                              filter: `
                                brightness(${overlayImageFilters[idx]?.brightness || 100}%)
                                contrast(${overlayImageFilters[idx]?.contrast || 100}%)
                                saturate(${overlayImageFilters[idx]?.saturation || 100}%)
                                grayscale(${overlayImageFilters[idx]?.grayscale || 0}%)
                                blur(${overlayImageFilters[idx]?.blur || 0}px)
                              `,
                            }}
                          />
                          <Button
                            color="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-2"
                            onClick={() => handleRemoveImage(idx)}
                          >
                            <FaTimes />
                          </Button>
                        </div>

                        <h6 className="mt-3">Filters</h6>
                        <SliderControl
                          label="Brightness"
                          value={overlayImageFilters[idx]?.brightness || 100}
                          min={0}
                          max={200}
                          onChange={(e) => handleOverlayImageFilterChange(idx, 'brightness', e.target.value)}
                          unit="%"
                        />
                        <SliderControl
                          label="Contrast"
                          value={overlayImageFilters[idx]?.contrast || 100}
                          min={0}
                          max={200}
                          onChange={(e) => handleOverlayImageFilterChange(idx, 'contrast', e.target.value)}
                          unit="%"
                        />
                        <SliderControl
                          label="Saturation"
                          value={overlayImageFilters[idx]?.saturation || 100}
                          min={0}
                          max={200}
                          onChange={(e) => handleOverlayImageFilterChange(idx, 'saturation', e.target.value)}
                          unit="%"
                        />
                        <SliderControl
                          label="Grayscale"
                          value={overlayImageFilters[idx]?.grayscale || 0}
                          min={0}
                          max={100}
                          onChange={(e) => handleOverlayImageFilterChange(idx, 'grayscale', e.target.value)}
                          unit="%"
                        />
                        <SliderControl
                          label="Blur"
                          value={overlayImageFilters[idx]?.blur || 0}
                          min={0}
                          max={10}
                          onChange={(e) => handleOverlayImageFilterChange(idx, 'blur', e.target.value)}
                          unit="px"
                        />

                        <h6 className="mt-3">Position & Size</h6>
                        <SliderControl
                          label="X Position"
                          value={overlaySettings.overlays[idx]?.x || 0}
                          min={0}
                          max={450}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newOverlays = [...overlaySettings.overlays];
                            newOverlays[idx] = { ...newOverlays[idx], x: val };
                            setOverlaySettings({ overlays: newOverlays });
                          }}
                          unit="px"
                        />
                        <SliderControl
                          label="Y Position"
                          value={overlaySettings.overlays[idx]?.y || 0}
                          min={0}
                          max={600}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newOverlays = [...overlaySettings.overlays];
                            newOverlays[idx] = { ...newOverlays[idx], y: val };
                            setOverlaySettings({ overlays: newOverlays });
                          }}
                          unit="px"
                        />
                        <SliderControl
                          label="Width"
                          value={overlaySettings.overlays[idx]?.width || 200}
                          min={50}
                          max={450}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newOverlays = [...overlaySettings.overlays];
                            newOverlays[idx] = { ...newOverlays[idx], width: val };
                            setOverlaySettings({ overlays: newOverlays });
                          }}
                          unit="px"
                        />
                        <SliderControl
                          label="Height"
                          value={overlaySettings.overlays[idx]?.height || 200}
                          min={50}
                          max={600}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newOverlays = [...overlaySettings.overlays];
                            newOverlays[idx] = { ...newOverlays[idx], height: val };
                            setOverlaySettings({ overlays: newOverlays });
                          }}
                          unit="px"
                        />

                        <h6 className="mt-3">Shape Settings</h6>
                        <Row>
                          <Col sm={6}>
                            <FormGroup>
                              <Label>Shape</Label>
                              <Input
                                type="select"
                                value={overlaySettings.overlays[idx]?.shape || 'rectangle'}
                                onChange={(e) => {
                                  const newOverlays = [...overlaySettings.overlays];
                                  newOverlays[idx] = { 
                                    ...newOverlays[idx], 
                                    shape: e.target.value,
                                    borderRadius: e.target.value === 'rounded' ? 20 : 0
                                  };
                                  setOverlaySettings({ overlays: newOverlays });
                                }}
                              >
                                {imageShapes.map((shape) => (
                                  <option key={shape} value={shape}>{shape}</option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                          {overlaySettings.overlays[idx]?.shape === 'rounded' && (
                            <Col sm={6}>
                              <SliderControl
                                label="Border Radius"
                                value={overlaySettings.overlays[idx]?.borderRadius || 0}
                                min={0}
                                max={100}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const newOverlays = [...overlaySettings.overlays];
                                  newOverlays[idx] = { ...newOverlays[idx], borderRadius: val };
                                  setOverlaySettings({ overlays: newOverlays });
                                }}
                                unit="px"
                              />
                            </Col>
                          )}
                        </Row>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          {/* Poster Preview Card */}
          {showPreview && (
            <Card className="mb-4">
              <CardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Poster Preview</span>
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <FaEyeSlash /> : <FaEye />}
                  <span className="ms-2">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                </Button>
              </CardHeader>
              <CardBody className="d-flex justify-content-center">
                <div
                  ref={previewRef}
                  className="poster-preview"
                  style={{
                    position: 'relative',
                    width: '450px',
                    height: '600px',
                    border: '2px solid #ddd',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  {/* Background image */}
                  {bgImageURL ? (
                    <img
                      src={bgImageURL}
                      alt="Background"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        filter: `
                          brightness(${bgImageFilter.brightness}%)
                          contrast(${bgImageFilter.contrast}%)
                          saturate(${bgImageFilter.saturation}%)
                          grayscale(${bgImageFilter.grayscale}%)
                          blur(${bgImageFilter.blur}px)
                        `,
                        zIndex: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}>
                      No Background Image Selected
                    </div>
                  )}

                  {/* Overlay images - ONLY THESE SHOW, NO TEXT */}
                  {images.map((imgSrc, idx) => {
                    const overlay = overlaySettings.overlays[idx] || { 
                      x: 100, 
                      y: 100, 
                      width: 200, 
                      height: 200,
                      shape: 'rectangle',
                      borderRadius: 0
                    };
                    const filters = overlayImageFilters[idx] || {
                      brightness: 100,
                      contrast: 100,
                      saturation: 100,
                      grayscale: 0,
                      blur: 0,
                    };

                    const shapeStyles = getShapeStyles(overlay.shape, overlay.borderRadius);

                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'absolute',
                          top: overlay.y,
                          left: overlay.x,
                          width: overlay.width,
                          height: overlay.height,
                          ...shapeStyles,
                          overflow: 'hidden',
                          cursor: 'move',
                          zIndex: 10,
                        }}
                        onMouseDown={(e) => handleMouseDown('image', idx, e)}
                      >
                        <img
                          src={imgSrc}
                          alt={`Overlay ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: `
                              brightness(${filters.brightness}%)
                              contrast(${filters.contrast}%)
                              saturate(${filters.saturation}%)
                              grayscale(${filters.grayscale}%)
                              blur(${filters.blur}px)
                            `,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}

          {errorMessage && (
            <div className="alert alert-danger">
              {errorMessage}
            </div>
          )}

          <div className="d-grid gap-2">
            <Button
              color="success"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Poster...' : 'Create Poster'}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreatePoster;
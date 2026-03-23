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
import { FaCloudUploadAlt, FaImage, FaTimes, FaSpinner } from 'react-icons/fa';

const CreateLogo = () => {
  const [logoName, setLogoName] = useState('');
  const [logoCategoryId, setLogoCategoryId] = useState('');
  const [logoImage, setLogoImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Logo categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch logo categories
  useEffect(() => {
    fetchLogoCategories();
  }, []);

  const fetchLogoCategories = async () => {
    setCategoriesLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.get('http://31.97.206.144:4061/api/admin/getlogocategories');
      // FIX: Response mein categories array hai, seedha response.data nahi
      console.log('Categories response:', response.data); // Debug ke liye
      
      // Check karo ki response mein categories array hai ya nahi
      if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else if (Array.isArray(response.data)) {
        // Agar seedha array hai
        setCategories(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setCategories([]);
        setErrorMessage('Invalid categories data format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to load logo categories. Please refresh the page.');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File size validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        return;
      }
      
      // File type validation
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Only JPG, PNG, GIF, SVG, and WEBP images are allowed');
        return;
      }
      
      setLogoImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setErrorMessage(''); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!logoName.trim()) {
      setErrorMessage('Logo name is required.');
      return;
    }

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
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('name', logoName.trim());
    formData.append('logoCategoryId', logoCategoryId);
    formData.append('image', logoImage);

    try {
      const response = await axios.post(
        'http://31.97.206.144:4061/api/admin/createlogo',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log('Logo created:', response.data);
      
      // Show success message
      setSuccessMessage('Logo created successfully!');
      
      // Reset form
      setLogoName('');
      setLogoCategoryId('');
      setLogoImage(null);
      setPreviewImage(null);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Auto navigate after 2 seconds
      setTimeout(() => {
        navigate('/logolist');
      }, 2000);

    } catch (error) {
      console.error('Error creating logo:', error);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <CardBody className="p-4">
              <CardTitle tag="h3" className="text-center text-primary mb-4">
                <FaImage className="me-2" />
                Create New Logo
              </CardTitle>

              {/* Error Alert */}
              {errorMessage && (
                <Alert color="danger" className="d-flex align-items-center">
                  <div className="me-2">⚠️</div>
                  <div>{errorMessage}</div>
                </Alert>
              )}

              {/* Success Alert */}
              {successMessage && (
                <Alert color="success" className="d-flex align-items-center">
                  <div className="me-2">✅</div>
                  <div>{successMessage}</div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Logo Name */}
                <FormGroup>
                  <Label for="logoName" className="fw-bold">
                    Logo Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="logoName"
                    value={logoName}
                    onChange={(e) => setLogoName(e.target.value)}
                    placeholder="Enter logo name (e.g., Happy Diwali Logo)"
                    required
                    disabled={loading}
                  />
                </FormGroup>

                {/* Logo Category Dropdown */}
                <FormGroup>
                  <Label for="logoCategory" className="fw-bold">
                    Select Category <span className="text-danger">*</span>
                  </Label>
                  {categoriesLoading ? (
                    <div className="text-center py-3 border rounded">
                      <FaSpinner className="spinner-border text-primary me-2" />
                      <span>Loading categories...</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="alert alert-warning mb-0">
                      <strong>No categories found!</strong>
                      <p className="mb-0 mt-2 small">
                        Please create categories first in the Category Management section.
                      </p>
                    </div>
                  ) : (
                    <Input
                      type="select"
                      id="logoCategory"
                      value={logoCategoryId}
                      onChange={(e) => setLogoCategoryId(e.target.value)}
                      required
                      disabled={loading}
                      className="form-select"
                    >
                      <option value="">-- Select a Category --</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName || category.name} 
                          {category.image === 'default-category-image.jpg' ? ' (No Image)' : ''}
                        </option>
                      ))}
                    </Input>
                  )}
                </FormGroup>

                {/* Image Upload Section */}
                <FormGroup>
                  <Label className="fw-bold">
                    Upload Logo Image <span className="text-danger">*</span>
                  </Label>
                  
                  {/* Image Preview */}
                  {previewImage ? (
                    <div className="border rounded p-4 text-center mb-3 bg-light">
                      <div className="position-relative d-inline-block">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="img-fluid rounded shadow-sm"
                          style={{ 
                            maxWidth: '100%',
                            maxHeight: '250px',
                            objectFit: 'contain' 
                          }}
                        />
                        <Button
                          type="button"
                          color="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 rounded-circle p-2"
                          onClick={removeImage}
                          style={{ 
                            width: '32px', 
                            height: '32px',
                            transform: 'translate(30%, -30%)'
                          }}
                          disabled={loading}
                        >
                          <FaTimes size={14} />
                        </Button>
                      </div>
                      <div className="mt-3">
                        <p className="text-success mb-2">
                          <FaCloudUploadAlt className="me-2" />
                          {logoImage?.name}
                        </p>
                        <Button
                          type="button"
                          color="secondary"
                          size="sm"
                          onClick={triggerFileInput}
                          disabled={loading}
                        >
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Upload Box */
                    <div 
                      className={`border rounded p-5 text-center ${!loading ? 'cursor-pointer' : ''}`}
                      onClick={!loading ? triggerFileInput : undefined}
                      style={{ 
                        backgroundColor: '#f8f9fa',
                        borderStyle: 'dashed',
                        borderColor: '#dee2e6',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = '#e9ecef';
                          e.currentTarget.style.borderColor = '#adb5bd';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#dee2e6';
                        }
                      }}
                    >
                      <FaCloudUploadAlt size={64} className="text-primary mb-3" />
                      <h5 className="mb-2">Click to upload logo image</h5>
                      <p className="text-muted mb-2">
                        Drag and drop or click to select
                      </p>
                      <p className="text-muted small">
                        Supported formats: JPG, PNG, GIF, SVG, WEBP (Max 5MB)
                      </p>
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                    style={{ display: 'none' }}
                  />
                </FormGroup>

                {/* Action Buttons */}
                <div className="d-flex justify-content-between pt-4 mt-3 border-top">
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => navigate('/logolist')}
                    disabled={loading}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={loading || !logoName.trim() || !logoCategoryId || !logoImage}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="spinner-border spinner-border-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Logo'
                    )}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateLogo;
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
  Badge
} from "reactstrap";
import { 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaFileAlt,
  FaCalendarAlt,
  FaInfoCircle,
  FaPlusCircle
} from "react-icons/fa";

const PrivacyPolicyPage = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiMessage, setApiMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios.get(
          "http://31.97.206.144:4061/api/admin/getpolicy"
        );
        
        console.log("API Response:", response.data); // Debug ke liye
        
        // Handle successful response
        if (response.data) {
          // Check if there's a message from backend
          if (response.data.message) {
            setApiMessage(response.data.message);
            setPrivacyPolicy(null);
          } else {
            // We have actual data
            setPrivacyPolicy(response.data);
            setTitle(response.data.title || "");
            setContent(response.data.content || "");
            setDate(response.data.date ? new Date(response.data.date).toISOString().slice(0, 10) : "");
            setApiMessage("");
          }
        }
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
        
        // Check if error response has message
        if (err.response && err.response.data && err.response.data.message) {
          // Show the actual backend message like "Privacy policy not found."
          setApiMessage(err.response.data.message);
          setPrivacyPolicy(null);
        } else if (err.response) {
          // Server responded with error but no message
          if (err.response.status === 404) {
            setApiMessage("Privacy policy endpoint not found");
          } else {
            setApiMessage(`Server error: ${err.response.status}`);
          }
        } else if (err.request) {
          // Network error
          setApiMessage("Network error - please check your connection");
        } else {
          // Other errors
          setApiMessage("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !date) {
      alert("Please fill in all fields before updating.");
      return;
    }
    
    try {
      setLoading(true);
      await axios.put(
        `http://31.97.206.144:4061/api/admin/updatepolicy/${privacyPolicy._id}`,
        { title, content, date }
      );
      
      // Show success message
      setApiMessage("Privacy policy updated successfully!");
      
      // Update local state
      setPrivacyPolicy({ ...privacyPolicy, title, content, date });
      setEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setApiMessage("");
      }, 3000);
      
    } catch (err) {
      console.error("Error updating privacy policy:", err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setApiMessage(err.response.data.message);
      } else {
        setApiMessage("Failed to update privacy policy.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the privacy policy?")) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(
        `http://31.97.206.144:4061/api/admin/deletepolicy/${privacyPolicy._id}`
      );
      
      // Show success message
      setApiMessage("Privacy policy deleted successfully!");
      
      // Clear local state
      setPrivacyPolicy(null);
      setTitle("");
      setContent("");
      setDate("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setApiMessage("");
      }, 3000);
      
    } catch (err) {
      console.error("Error deleting privacy policy:", err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setApiMessage(err.response.data.message);
      } else {
        setApiMessage("Failed to delete privacy policy.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    // Set edit mode and clear form for new policy
    setEditMode(true);
    setPrivacyPolicy({ _id: "new" });
    setTitle("");
    setContent("");
    setDate(new Date().toISOString().slice(0, 10));
    setApiMessage("");
  };

  // Loading State
  if (loading) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <CardBody className="text-center py-5">
                <Spinner color="primary" style={{ width: '3rem', height: '3rem' }}>
                  Loading...
                </Spinner>
                <p className="mt-3 text-muted">Loading privacy policy...</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg border-0">
            <CardHeader 
              className="py-3 d-flex align-items-center"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderBottom: 'none'
              }}
            >
              <FaFileAlt className="me-2" size={24} />
              <h4 className="mb-0">Privacy Policy Management</h4>
            </CardHeader>
            
            <CardBody className="p-4">
              {/* API Message Display - Shows backend messages like "Privacy policy not found." */}
              {apiMessage && (
                <Alert 
                  color={apiMessage.includes('successfully') ? 'success' : 'info'}
                  className="d-flex align-items-center border-0 shadow-sm mb-4"
                  style={{ 
                    backgroundColor: apiMessage.includes('successfully') ? '#d4edda' : '#e3f2fd'
                  }}
                >
                  <FaInfoCircle className={`me-3 ${apiMessage.includes('successfully') ? 'text-success' : 'text-primary'}`} size={20} />
                  <div>
                    <strong className="d-block mb-1">
                      {apiMessage.includes('successfully') ? 'Success' : 'Information'}
                    </strong>
                    <p className="mb-0">{apiMessage}</p>
                  </div>
                </Alert>
              )}

              {/* No Policy Found State - Shows when backend returns "Privacy policy not found." */}
              {!privacyPolicy && !editMode && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <FaFileAlt size={64} className="text-muted" style={{ opacity: 0.5 }} />
                  </div>
                  <h5 className="text-muted mb-3">No Privacy Policy Found</h5>
                  <p className="text-muted mb-4">
                    There is no privacy policy available. Would you like to create one?
                  </p>
                  <Button
                    color="primary"
                    onClick={handleCreate}
                    className="px-4"
                  >
                    <FaPlusCircle className="me-2" />
                    Create New Policy
                  </Button>
                </div>
              )}

              {/* Edit Mode Form */}
              {editMode && (
                <Form>
                  <FormGroup>
                    <Label for="title" className="fw-bold">
                      Policy Title <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter policy title (e.g., Privacy Policy)"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="content" className="fw-bold">
                      Policy Content <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="textarea"
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter policy content here..."
                      required
                      style={{ minHeight: '200px' }}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="date" className="fw-bold">
                      Effective Date <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <div className="d-flex gap-2 mt-4">
                    <Button
                      color="primary"
                      onClick={handleUpdate}
                      disabled={loading || !title.trim() || !content.trim() || !date}
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          {privacyPolicy?._id === "new" ? "Create Policy" : "Update Policy"}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      color="secondary"
                      onClick={() => {
                        setEditMode(false);
                        if (privacyPolicy && privacyPolicy._id !== "new") {
                          setTitle(privacyPolicy.title || "");
                          setContent(privacyPolicy.content || "");
                          setDate(privacyPolicy.date ? new Date(privacyPolicy.date).toISOString().slice(0, 10) : "");
                        }
                      }}
                      disabled={loading}
                    >
                      <FaTimes className="me-2" />
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}

              {/* View Mode - Shows when policy exists */}
              {privacyPolicy && privacyPolicy._id !== "new" && !editMode && (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h2 className="text-primary mb-2">{privacyPolicy.title}</h2>
                      <div className="d-flex align-items-center text-muted">
                        <FaCalendarAlt className="me-2" size={14} />
                        <small>
                          Effective Date: {new Date(privacyPolicy.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </small>
                      </div>
                    </div>
                    <Badge color="success" pill className="px-3 py-2">
                      Active
                    </Badge>
                  </div>

                  <div className="border rounded p-4 bg-light mb-4">
                    <div className="text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                      {privacyPolicy.content}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      color="primary"
                      onClick={() => setEditMode(true)}
                      className="px-4"
                    >
                      <FaEdit className="me-2" />
                      Edit Policy
                    </Button>
                    
                    <Button
                      color="danger"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FaTrash className="me-2" />
                          Delete Policy
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPolicyPage;
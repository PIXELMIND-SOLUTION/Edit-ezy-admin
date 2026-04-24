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
  FaInfoCircle,
  FaPlusCircle,
  FaCalendarAlt,
  FaUserTie,
  FaBuilding,
  FaHistory
} from "react-icons/fa";

const GetAboutUsPage = () => {
  const [aboutUsData, setAboutUsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiMessage, setApiMessage] = useState("");

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        const response = await axios.get("http://31.97.228.17:4061/api/admin/getaboutus");
        
        console.log("API Response:", response.data); // Debug ke liye

        // Handle successful response
        if (response.data) {
          // Check if there's a message from backend
          if (response.data.message) {
            setApiMessage(response.data.message);
            setAboutUsData(null);
          } else {
            // We have actual data
            setAboutUsData(response.data);
            setTitle(response.data.title || "");
            setContent(response.data.content || "");
            setDate(response.data.date ? new Date(response.data.date).toISOString().slice(0, 10) : "");
            setApiMessage("");
          }
        }
      } catch (err) {
        console.error("Error fetching About Us data:", err);
        
        // Check if error response has message
        if (err.response && err.response.data && err.response.data.message) {
          // Show the actual backend message like "About Us not found"
          setApiMessage(err.response.data.message);
          setAboutUsData(null);
        } else if (err.response) {
          // Server responded with error but no message
          if (err.response.status === 404) {
            setApiMessage("About Us endpoint not found");
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

    fetchAboutUsData();
  }, []);

  // Handle update API call
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !date) {
      setApiMessage("Please fill in all fields before updating.");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://31.97.228.17:4061/api/admin/updateaboutus/${aboutUsData._id}`,
        { title, content, date }
      );
      
      setApiMessage("About Us updated successfully!");
      setAboutUsData({ ...aboutUsData, title, content, date });
      setEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setApiMessage("");
      }, 3000);
      
    } catch (err) {
      console.error("Error updating About Us:", err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setApiMessage(err.response.data.message);
      } else {
        setApiMessage("Failed to update About Us. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete API call
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the About Us data?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `http://31.97.228.17:4061/api/admin/deleteaboutus/${aboutUsData._id}`
      );
      
      setApiMessage("About Us deleted successfully!");
      setAboutUsData(null);
      setTitle("");
      setContent("");
      setDate("");
      setEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setApiMessage("");
      }, 3000);
      
    } catch (err) {
      console.error("Error deleting About Us:", err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setApiMessage(err.response.data.message);
      } else {
        setApiMessage("Failed to delete About Us. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    // Set edit mode and clear form for new about us
    setEditMode(true);
    setAboutUsData({ _id: "new" });
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
            <Card className="shadow-lg border-0">
              <CardBody className="text-center py-5">
                <Spinner color="primary" style={{ width: '3rem', height: '3rem' }}>
                  Loading...
                </Spinner>
                <p className="mt-3 text-muted">Loading About Us information...</p>
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
              <FaBuilding className="me-2" size={24} />
              <h4 className="mb-0">About Us Management</h4>
            </CardHeader>
            
            <CardBody className="p-4">
              {/* API Message Display - Shows backend messages like "About Us not found" */}
              {apiMessage && (
                <Alert 
                  color={apiMessage.includes('successfully') ? 'success' : 'info'}
                  className="d-flex align-items-center border-0 shadow-sm mb-4"
                  style={{ 
                    backgroundColor: apiMessage.includes('successfully') ? '#d4edda' : '#e3f2fd',
                    borderLeft: apiMessage.includes('successfully') ? '4px solid #28a745' : '4px solid #17a2b8'
                  }}
                >
                  <FaInfoCircle className={`me-3 ${apiMessage.includes('successfully') ? 'text-success' : 'text-primary'}`} size={20} />
                  <div>
                    <strong className="d-block mb-1">
                      {apiMessage.includes('successfully') ? '✓ Success' : 'ℹ Information'}
                    </strong>
                    <p className="mb-0">{apiMessage}</p>
                  </div>
                </Alert>
              )}

              {/* No About Us Found State - Shows when backend returns "About Us not found" */}
              {!aboutUsData && !editMode && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <div className="position-relative d-inline-block">
                      <FaBuilding size={80} className="text-muted" style={{ opacity: 0.3 }} />
                      <FaInfoCircle 
                        size={30} 
                        className="text-primary position-absolute" 
                        style={{ bottom: 0, right: -10 }}
                      />
                    </div>
                  </div>
                  <h4 className="text-muted mb-3">No About Us Information Found</h4>
                  <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    There is no "About Us" content available. Would you like to create one to share your story with your audience?
                  </p>
                  <Button
                    color="primary"
                    onClick={handleCreate}
                    className="px-4 py-2"
                    size="lg"
                  >
                    <FaPlusCircle className="me-2" />
                    Create About Us Content
                  </Button>
                </div>
              )}

              {/* Edit Mode Form */}
              {editMode && (
                <Form>
                  <FormGroup>
                    <Label for="title" className="fw-bold">
                      <FaUserTie className="me-2 text-primary" />
                      Title <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title (e.g., About Our Company)"
                      required
                      className="border-2"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="content" className="fw-bold">
                      <FaHistory className="me-2 text-primary" />
                      Content <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="textarea"
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Tell your story, mission, vision, and values..."
                      required
                      style={{ minHeight: '250px' }}
                      className="border-2"
                    />
                    <small className="text-muted">
                      {content.length} characters • Markdown supported
                    </small>
                  </FormGroup>

                  <FormGroup>
                    <Label for="date" className="fw-bold">
                      <FaCalendarAlt className="me-2 text-primary" />
                      Publication Date <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="border-2"
                    />
                  </FormGroup>

                  <div className="d-flex gap-2 mt-4">
                    <Button
                      color="primary"
                      onClick={handleUpdate}
                      disabled={loading || !title.trim() || !content.trim() || !date}
                      className="px-4"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          {aboutUsData?._id === "new" ? "Creating..." : "Updating..."}
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          {aboutUsData?._id === "new" ? "Create About Us" : "Update About Us"}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      color="secondary"
                      onClick={() => {
                        setEditMode(false);
                        if (aboutUsData && aboutUsData._id !== "new") {
                          setTitle(aboutUsData.title || "");
                          setContent(aboutUsData.content || "");
                          setDate(aboutUsData.date ? new Date(aboutUsData.date).toISOString().slice(0, 10) : "");
                        }
                      }}
                      disabled={loading}
                      size="lg"
                    >
                      <FaTimes className="me-2" />
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}

              {/* View Mode - Shows when about us exists */}
              {aboutUsData && aboutUsData._id !== "new" && !editMode && (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h2 className="text-primary mb-2">{aboutUsData.title}</h2>
                      <div className="d-flex align-items-center text-muted">
                        <FaCalendarAlt className="me-2" size={14} />
                        <small>
                          Published on: {new Date(aboutUsData.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </small>
                      </div>
                    </div>
                    <Badge color="success" pill className="px-3 py-2">
                      <FaInfoCircle className="me-1" size={12} />
                      Active
                    </Badge>
                  </div>

                  <div className="border rounded p-4 bg-light mb-4">
                    <div className="text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                      {aboutUsData.content}
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <Button
                      color="primary"
                      onClick={() => setEditMode(true)}
                      className="px-4"
                      size="lg"
                    >
                      <FaEdit className="me-2" />
                      Edit Content
                    </Button>
                    
                    <Button
                      color="danger"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FaTrash className="me-2" />
                          Delete
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

export default GetAboutUsPage;
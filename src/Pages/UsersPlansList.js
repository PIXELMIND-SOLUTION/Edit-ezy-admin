import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner,
  Alert,
  Badge
} from 'reactstrap';
import { 
  FaUsers, 
  FaEnvelope, 
  FaMobile, 
  FaCrown, 
  FaCalendarAlt,
  FaRupeeSign,
  FaPercent,
  FaInfoCircle,
  FaSearch,
  FaSmile
} from 'react-icons/fa';

const UsersPlansList = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiMessage, setApiMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUserPlans = async () => {
      try {
        const response = await axios.get('http://31.97.206.144:4061/api/admin/usersplans');
        
        console.log('API Response:', response.data); // Debug ke liye
        
        // Agar response mein sirf message hai to woh dikhao
        if (response.data && response.data.message) {
          setApiMessage(response.data.message);
          setUsersData([]);
        }
        // Agar users array hai to set karo
        else if (response.data && response.data.users) {
          setUsersData(response.data.users);
          setApiMessage('');
        }
        // Agar direct array hai
        else if (Array.isArray(response.data)) {
          setUsersData(response.data);
          setApiMessage('');
        }
        // Kuch aur hai
        else {
          setApiMessage('No data available');
          setUsersData([]);
        }
        
      } catch (err) {
        console.error('API Error:', err);
        
        // Check if error response has message
        if (err.response && err.response.data && err.response.data.message) {
          // YAHI IMPORTANT PART HAI - backend ka message dikhao
          setApiMessage(err.response.data.message);
          setUsersData([]);
        } else if (err.response) {
          // Server responded with error but no message
          if (err.response.status === 404) {
            setApiMessage('API endpoint not found');
          } else {
            setApiMessage(`Server error: ${err.response.status}`);
          }
        } else if (err.request) {
          // Network error
          setApiMessage('Network error - please check your connection');
        } else {
          // Other errors
          setApiMessage('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlans();
  }, []);

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = usersData.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(usersData.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Loading State
  if (loading) {
    return (
      <Container fluid className="mt-4">
        <Row className="justify-content-center">
          <Col lg="10">
            <Card className="shadow-sm border-0">
              <CardBody className="text-center py-5">
                <Spinner color="primary" style={{ width: '3rem', height: '3rem' }}>
                  Loading...
                </Spinner>
                <p className="mt-3 text-muted">Fetching users data...</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col lg="10">
          <Card className="shadow-sm border-0">
            <CardHeader 
              className="py-3 d-flex align-items-center" 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderBottom: 'none'
              }}
            >
              <FaUsers className="me-2" size={20} />
              <h5 className="mb-0">Users with Subscribed Plans</h5>
            </CardHeader>
            
            <CardBody className="p-4">
              {/* API Message Display - YEH DIKHEGA JAB {"message":"No valid users with subscribed plans found"} */}
              {apiMessage && (
                <Alert 
                  color="info" 
                  className="d-flex align-items-center border-0 shadow-sm"
                  style={{ backgroundColor: '#e3f2fd' }}
                >
                  <FaInfoCircle className="me-3 text-primary" size={24} />
                  <div>
                    <strong className="d-block mb-1">Information</strong>
                    <p className="mb-0">{apiMessage}</p>
                  </div>
                </Alert>
              )}

              {/* No Data State with Message */}
              {!apiMessage && usersData.length === 0 && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <FaSearch size={64} className="text-muted" style={{ opacity: 0.5 }} />
                  </div>
                  <h5 className="text-muted mb-3">No Users Found</h5>
                  <p className="text-muted mb-0">
                    There are currently no users with active subscribed plans.
                  </p>
                </div>
              )}

              {/* Data Table - Only show if we have users */}
              {usersData.length > 0 && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge color="primary" pill className="px-3 py-2">
                      Total Users: {usersData.length}
                    </Badge>
                  </div>

                  <div className="table-responsive">
                    <Table hover bordered className="mb-3 align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th className="text-center" width="50">#</th>
                          <th>User Details</th>
                          <th>Contact</th>
                          <th>Subscribed Plans</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user, index) => (
                          <tr key={user._id || user.email || index}>
                            <td className="text-center fw-bold">
                              {indexOfFirstUser + index + 1}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                                  style={{ width: '35px', height: '35px' }}
                                >
                                  <span className="text-white fw-bold">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <div className="fw-bold">{user.name || 'N/A'}</div>
                                  <small className="text-muted">
                                    ID: {user._id?.substring(0, 8) || 'N/A'}...
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="mb-1">
                                <FaEnvelope className="text-primary me-2" size={12} />
                                <small>{user.email || 'N/A'}</small>
                              </div>
                              <div>
                                <FaMobile className="text-success me-2" size={12} />
                                <small>{user.mobile || 'N/A'}</small>
                              </div>
                            </td>
                            <td>
                              {user.subscribedPlans?.length > 0 ? (
                                <div>
                                  {user.subscribedPlans.map((plan, i) => (
                                    <div 
                                      key={i} 
                                      className="border rounded p-2 mb-2 bg-light"
                                      style={{ borderLeft: '4px solid #667eea' }}
                                    >
                                      <div className="d-flex justify-content-between align-items-start">
                                        <strong className="text-primary">
                                          <FaCrown className="me-1" size={12} />
                                          {plan.name || 'Plan'}
                                        </strong>
                                        <Badge color="success" pill>Active</Badge>
                                      </div>
                                      
                                      <div className="mt-2 small">
                                        <div className="d-flex align-items-center mb-1">
                                          <FaRupeeSign className="text-success me-1" size={10} />
                                          <span className="fw-bold me-2">₹{plan.offerPrice || 0}</span>
                                          <FaPercent className="text-info me-1" size={10} />
                                          <span>{plan.discountPercentage || 0}% off</span>
                                        </div>
                                        
                                        <div className="d-flex align-items-center text-muted">
                                          <FaCalendarAlt className="me-1" size={10} />
                                          <span>
                                            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                                          </span>
                                        </div>
                                        
                                        <div className="mt-1">
                                          <Badge color="secondary" pill>
                                            {plan.duration || 'N/A'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center text-muted py-2">
                                  <small>No active plans</small>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted small">
                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, usersData.length)} of {usersData.length} entries
                      </div>
                      
                      <Pagination size="sm">
                        <PaginationItem disabled={currentPage === 1}>
                          <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i} active={i + 1 === currentPage}>
                            <PaginationLink onClick={() => handlePageChange(i + 1)}>
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem disabled={currentPage === totalPages}>
                          <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
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
  );
};

export default UsersPlansList;
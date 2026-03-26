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
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table
} from 'reactstrap';
import axios from 'axios';
import { 
  FaTrash, 
  FaSave,
  FaEdit,
  FaMoneyBillWave,
  FaTimes,
  FaPlus,
  FaList
} from 'react-icons/fa';

const AmountSettings = () => {
  const [amounts, setAmounts] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  
  // Options for dropdown
  const nameOptions = [
    'Poster',
    'Logo',
    'Reels',
    'Stickers',
    'Business Card',
  ];

  // Alert states
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Format amount with number formatting
  const formatAmount = (value) => {
    if (!value) return '0';
    return parseInt(value).toLocaleString('en-IN');
  };

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

  // Fetch all amounts
  const fetchAllAmounts = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get('http://31.97.206.144:4061/api/admin/allamount');
      if (response.data.success) {
        setAmounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching amounts:', error);
      showAlert('Failed to load amounts', 'danger');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAmounts();
  }, []);

  // Handle new amount change
  const handleNewAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  };

  // Handle edit amount change
  const handleEditAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setEditAmount(value);
    }
  };

  // Handle add new configuration
  const handleAdd = async () => {
    if (!name.trim()) {
      showAlert('Please select a name', 'danger');
      return;
    }
    if (!amount || amount === '0') {
      showAlert('Please enter valid amount', 'danger');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://31.97.206.144:4061/api/admin/setamount', {
        name: name,
        amount: parseInt(amount)
      });
      
      if (response.data.success) {
        showAlert('Amount added successfully!');
        setName('');
        setAmount('');
        setAddModalOpen(false);
        fetchAllAmounts();
      }
    } catch (error) {
      console.error('Error adding amount:', error);
      showAlert(error.response?.data?.message || 'Error adding amount', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditId(item._id);
    setEditName(item.name);
    setEditAmount(item.amount.toString());
    setEditModalOpen(true);
  };

  // Handle update from modal
  const handleUpdate = async () => {
    if (!editName.trim()) {
      showAlert('Please select a name', 'danger');
      return;
    }
    if (!editAmount || editAmount === '0') {
      showAlert('Please enter valid amount', 'danger');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://31.97.206.144:4061/api/admin/setamount', {
        name: editName,
        amount: parseInt(editAmount)
      });
      
      if (response.data.success) {
        showAlert('Amount updated successfully!');
        setEditModalOpen(false);
        fetchAllAmounts();
      }
    } catch (error) {
      console.error('Error updating amount:', error);
      showAlert(error.response?.data?.message || 'Error updating amount', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete amount
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`http://31.97.206.144:4061/api/admin/amount/${editId}`);
      
      if (response.data.success) {
        showAlert('Amount deleted successfully!');
        setDeleteModalOpen(false);
        fetchAllAmounts();
      }
    } catch (error) {
      console.error('Error deleting amount:', error);
      showAlert(error.response?.data?.message || 'Error deleting amount', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Get icon based on name
  const getIcon = (name) => {
    switch(name) {
      case 'Poster':
        return 'ri-image-fill';
      case 'Logo':
        return 'ri-palette-fill';
      case 'Reels':
        return 'ri-video-fill';
      case 'Stickers':
        return 'ri-sticker-fill';
      case 'Business Card':
        return 'ri-id-card-fill';
      case 'Audio':
        return 'ri-music-fill';
      case 'Banner':
        return 'ri-gallery-fill';
      case 'Category':
        return 'ri-image-fill';
      default:
        return 'ri-list-check';
    }
  };

  return (
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
              <h2 className="mb-1">
                <FaMoneyBillWave className="me-2 text-success" />
                Amount Configuration
              </h2>
              <p className="text-muted mb-0">Manage amount configurations for different modules</p>
            </div>
            <Button color="primary" onClick={() => setAddModalOpen(true)}>
              <FaPlus className="me-2" />
              Add Config
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={10} className="mx-auto">
          <Card className="shadow-sm">
            <CardBody>
              {fetchLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading configurations...</p>
                </div>
              ) : (
                <Table bordered hover responsive>
                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Amount</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amounts.length > 0 ? (
                      amounts.map((item, index) => (
                        <tr key={item._id}>
                          <td>{index + 1}</td>
                          <td className="fw-bold">
                            <i className={`${getIcon(item.name)} me-2 text-primary`}></i>
                            {item.name}
                          </td>
                          <td>
                            <FaMoneyBillWave className="me-2 text-success" />
                            ₹ {formatAmount(item.amount)}
                          </td>
                          <td className="text-center">
                            <Button
                              color="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(item)}
                              title="Edit Config"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => {
                                setEditId(item._id);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete Config"
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          <FaMoneyBillWave size={32} className="text-muted mb-2" />
                          <p className="text-muted mb-0">No configurations found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal isOpen={addModalOpen} toggle={() => setAddModalOpen(false)} centered>
        <ModalHeader toggle={() => setAddModalOpen(false)}>
          <FaPlus className="me-2 text-success" />
          Add Amount Configuration
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="name" className="fw-bold">Name *</Label>
            <Input
              type="select"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            >
              <option value="">Select Name</option>
              {nameOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="amount" className="fw-bold">Amount *</Label>
            <div className="position-relative">
              <FaMoneyBillWave className="position-absolute start-0 top-0 mt-3 ms-3 text-success" />
              <Input
                type="text"
                id="amount"
                placeholder="Enter amount"
                value={amount}
                onChange={handleNewAmountChange}
                className="ps-5"
                style={{ height: '48px' }}
                required
              />
            </div>
            <small className="text-muted">
              Enter the amount value (in rupees)
            </small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setAddModalOpen(false)}>
            <FaTimes className="me-1" />
            Cancel
          </Button>
          <Button color="primary" onClick={handleAdd} disabled={loading || !name || !amount || amount === '0'}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adding...
              </>
            ) : (
              <>
                <FaSave className="me-1" />
                Add
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(false)} centered>
        <ModalHeader toggle={() => setEditModalOpen(false)}>
          <FaEdit className="me-2 text-warning" />
          Edit Amount Configuration
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="editName" className="fw-bold">Name *</Label>
            <Input
              type="select"
              id="editName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            >
              <option value="">Select Name</option>
              {nameOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="editAmount" className="fw-bold">Amount *</Label>
            <div className="position-relative">
              <FaMoneyBillWave className="position-absolute start-0 top-0 mt-3 ms-3 text-success" />
              <Input
                type="text"
                id="editAmount"
                placeholder="Enter amount"
                value={editAmount}
                onChange={handleEditAmountChange}
                className="ps-5"
                style={{ height: '48px' }}
                required
              />
            </div>
            <small className="text-muted">
              Enter the amount value (in rupees)
            </small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModalOpen(false)}>
            <FaTimes className="me-1" />
            Cancel
          </Button>
          <Button color="primary" onClick={handleUpdate} disabled={loading || !editName || !editAmount || editAmount === '0'}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              <>
                <FaSave className="me-1" />
                Update
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)} centered>
        <ModalHeader toggle={() => setDeleteModalOpen(false)} className="bg-danger text-white">
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-3">
            <div className="mb-3">
              <FaTrash size={48} className="text-danger" />
            </div>
            <h5>Delete Configuration?</h5>
            <p className="text-muted">
              This will permanently delete this amount configuration.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default AmountSettings;
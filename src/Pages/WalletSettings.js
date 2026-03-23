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
  FaCoins,
  FaTimes,
  FaPlus
} from 'react-icons/fa';

const WalletSettings = () => {
  const [coins, setCoins] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newCoins, setNewCoins] = useState('');
  const [editCoins, setEditCoins] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Alert states
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Format coins with number formatting
  const formatCoins = (value) => {
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

  // Fetch current wallet coins
  const fetchWalletCoins = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get('http://31.97.206.144:4061/api/admin/getwallet');
      if (response.data.success) {
        setCoins(response.data.amount.toString());
        if (response.data.amount > 0) {
          setEditMode(true);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet coins:', error);
      if (error.response?.status === 404) {
        setCoins('');
        setEditMode(false);
      } else {
        showAlert('Failed to load wallet settings', 'danger');
      }
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletCoins();
  }, []);

  // Handle new coins change
  const handleNewCoinsChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setNewCoins(value);
    }
  };

  // Handle edit coins change
  const handleEditCoinsChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setEditCoins(value);
    }
  };

  // Handle add new configuration
  const handleAdd = async () => {
    if (!newCoins || newCoins === '0') {
      showAlert('Please enter valid coins', 'danger');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://31.97.206.144:4061/api/admin/setwallet', {
        amount: parseInt(newCoins)
      });
      
      if (response.data.success) {
        showAlert('User coins config added successfully!');
        setCoins(newCoins);
        setEditMode(true);
        setAddModalOpen(false);
        setNewCoins('');
        fetchWalletCoins();
      }
    } catch (error) {
      console.error('Error adding wallet coins:', error);
      showAlert(error.response?.data?.message || 'Error adding user coins config', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle update from modal
  const handleUpdate = async () => {
    if (!editCoins || editCoins === '0') {
      showAlert('Please enter valid coins', 'danger');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://31.97.206.144:4061/api/admin/setwallet', {
        amount: parseInt(editCoins)
      });
      
      if (response.data.success) {
        showAlert('User coins config updated successfully!');
        setCoins(editCoins);
        setEditMode(true);
        setEditModalOpen(false);
        fetchWalletCoins();
      }
    } catch (error) {
      console.error('Error updating wallet coins:', error);
      showAlert(error.response?.data?.message || 'Error updating user coins config', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete wallet config
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await axios.delete('http://31.97.206.144:4061/api/admin/deletewallet');
      
      if (response.data.success) {
        showAlert('User coins config deleted successfully!');
        setCoins('');
        setEditMode(false);
        setDeleteModalOpen(false);
        fetchWalletCoins();
      }
    } catch (error) {
      console.error('Error deleting wallet config:', error);
      showAlert(error.response?.data?.message || 'Error deleting user coins config', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                  <FaCoins className="me-2 text-warning" />
                  User Coins Config
                </h2>
                <p className="text-muted mb-0">Configure user coins</p>
              </div>
              <Button color="primary" onClick={() => setAddModalOpen(true)}>
                <FaPlus className="me-2" />
                Add Config
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="shadow-sm">
              <CardBody>
                {fetchLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading configuration...</p>
                  </div>
                ) : (
                  <>
                    {/* Table View */}
                    <Table bordered hover responsive>
                      <thead className="bg-light">
                        <tr>
                          <th>Coins Amount</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editMode && coins ? (
                          <tr>
                            <td className="fw-bold">
                              <FaCoins className="me-2 text-warning" />
                              {formatCoins(coins)} Coins
                            </td>
                            <td className="text-center">
                              <Button
                                color="warning"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setEditCoins(coins);
                                  setEditModalOpen(true);
                                }}
                                title="Edit Config"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => setDeleteModalOpen(true)}
                                title="Delete Config"
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center py-4">
                              <FaCoins size={32} className="text-muted mb-2" />
                              <p className="text-muted mb-0">No configuration found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add Modal */}
      <Modal isOpen={addModalOpen} toggle={() => setAddModalOpen(false)} centered>
        <ModalHeader toggle={() => setAddModalOpen(false)}>
          <FaPlus className="me-2 text-success" />
          Add User Coins Config
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="newCoins" className="fw-bold">Coins Amount</Label>
            <div className="position-relative">
              <FaCoins className="position-absolute start-0 top-0 mt-3 ms-3 text-warning" />
              <Input
                type="text"
                id="newCoins"
                placeholder="Enter coins amount"
                value={newCoins}
                onChange={handleNewCoinsChange}
                className="ps-5"
                style={{ height: '48px' }}
                required
              />
            </div>
            <small className="text-muted">
              Set the default coins for users
            </small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setAddModalOpen(false)}>
            <FaTimes className="me-1" />
            Cancel
          </Button>
          <Button color="primary" onClick={handleAdd} disabled={loading || !newCoins || newCoins === '0'}>
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
          Edit User Coins Config
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="editCoins" className="fw-bold">Coins Amount</Label>
            <div className="position-relative">
              <FaCoins className="position-absolute start-0 top-0 mt-3 ms-3 text-warning" />
              <Input
                type="text"
                id="editCoins"
                placeholder="Enter coins amount"
                value={editCoins}
                onChange={handleEditCoinsChange}
                className="ps-5"
                style={{ height: '48px' }}
                required
              />
            </div>
            <small className="text-muted">
              Set the default coins for users
            </small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModalOpen(false)}>
            <FaTimes className="me-1" />
            Cancel
          </Button>
          <Button color="primary" onClick={handleUpdate} disabled={loading || !editCoins || editCoins === '0'}>
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
              This will remove the user coins configuration.
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
    </>
  );
};

export default WalletSettings;
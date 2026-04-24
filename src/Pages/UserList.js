import { useState, useEffect } from "react";
import { FaTrash, FaEye, FaUser } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "reactstrap";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://31.97.228.17:4061/api/admin/getallusers")
      .then((res) => {
        if (res.data && res.data.users) {
          setUsers(res.data.users);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://31.97.228.17:4061/api/admin/deleteuser/${id}`);
        alert("User deleted successfully");
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const exportData = (type) => {
    const exportUsers = filteredUsers.map((user, index) => ({
      "Sl No": index + 1,
      Name: user.name || "N/A",
      Email: user.email || "N/A",
      Mobile: user.mobile || "N/A",
      "Profile Image": user.profileImage || "N/A"
    }));
    const ws = utils.json_to_sheet(exportUsers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Users");
    writeFile(wb, `users.${type}`);
  };

  const filteredUsers = users.filter((user) =>
    (user.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <>
      <div className="p-4 border rounded-lg shadow-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">All Users</h2>
            <p className="text-muted small">Total Users: {users.length}</p>
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <input
            className="w-1/3 p-2 border rounded"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={() => exportData("csv")}>
              CSV
            </button>
            <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={() => exportData("xlsx")}>
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="p-2 border">Sl</th>
                <th className="p-2 border">Profile</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Mobile</th>
                <th className="p-2 border">Actions</th>
               </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border text-center">{index + 1 + indexOfFirstUser}</td>
                  <td className="p-2 border text-center">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                        onClick={() => handleView(user)}
                        onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer mx-auto">
                        <FaUser className="text-gray-600" />
                      </div>
                    )}
                  </td>
                  <td className="p-2 border font-medium">{user.name || "N/A"}</td>
                  <td className="p-2 border">{user.email || "N/A"}</td>
                  <td className="p-2 border">{user.mobile || "N/A"}</td>
                  <td className="p-2 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        onClick={() => handleView(user)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        onClick={() => handleDelete(user.id)}
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-muted small">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-100 rounded">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View User Modal */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(false)} size="md" centered>
        <ModalHeader toggle={() => setViewModalOpen(false)} className="bg-primary text-white">
          User Details
        </ModalHeader>
        <ModalBody>
          {selectedUser && (
            <div className="p-3">
              <div className="text-center mb-4">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/128")}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center mx-auto border-4 border-primary">
                    <FaUser size={48} className="text-gray-600" />
                  </div>
                )}
                <h3 className="mt-3 mb-1 font-bold text-xl">{selectedUser.name || "N/A"}</h3>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-muted small d-block">User ID</label>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-muted small d-block">Email</label>
                    <p className="bg-gray-50 p-2 rounded">{selectedUser.email || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-muted small d-block">Mobile Number</label>
                    <p className="bg-gray-50 p-2 rounded">{selectedUser.mobile || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
import React, { useState, useEffect } from "react";
import axios from "axios";

const GetProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        setError("No admin ID found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://31.97.206.144:4061/api/admin/profile/${adminId}`
        );
        setProfileData(response.data.admin);
        setFormData({
          name: response.data.admin.name || "",
          email: response.data.admin.email || "",
          phone: response.data.admin.phone || "",
        });
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const adminId = localStorage.getItem("adminId");

    try {
      const response = await axios.put(
        `http://31.97.206.144:4061/api/admin/updateprofile/${adminId}`,
        formData
      );
      setProfileData(response.data.admin);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Admin Profile</h2>

      {loading && <p>Loading profile...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}

      {!loading && profileData && (
        <div className="space-y-4">
          {!isEditing ? (
            <div className="p-4 border border-gray-200 rounded shadow-sm bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Profile Information</h3>
              <p className="text-sm text-gray-600"><strong>Name:</strong> {profileData.name}</p>
              <p className="text-sm text-gray-600"><strong>Email:</strong> {profileData.email}</p>
              <p className="text-sm text-gray-600"><strong>Phone:</strong> {profileData.phone}</p>
              <p className="text-sm text-gray-600"><strong>Joined On:</strong> {new Date(profileData.createdAt).toLocaleString()}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-700 text-white text-sm rounded hover:bg-blue-800"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4 p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Edit Profile</h3>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                placeholder="Name"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                placeholder="Email"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                placeholder="Phone"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default GetProfilePage;

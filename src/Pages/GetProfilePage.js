import React, { useState, useEffect } from "react";
import axios from "axios";

const GetProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      // Get adminId from localStorage
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        setError("No admin ID found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        // Make the API call to get the admin profile using adminId
        const response = await axios.get(`https://posterbackend.onrender.com/api/admin/profile/${adminId}`);
        
        // Log the response to check the profile data
        console.log("Profile Data Response:", response.data);

        // Adjusted to set the 'admin' object from the response
        setProfileData(response.data.admin);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Admin Profile</h2>

      {loading && <p>Loading profile...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !profileData && (
        <p className="text-gray-600">No profile found.</p>
      )}

      {!loading && profileData && (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded shadow-sm bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Profile Information
            </h3>
            <p className="text-sm text-gray-600"><strong>Name:</strong> {profileData.name}</p>
            <p className="text-sm text-gray-600"><strong>Email:</strong> {profileData.email}</p>
            <p className="text-sm text-gray-600"><strong>Phone:</strong> {profileData.phone}</p>
            <p className="text-sm text-gray-600"><strong>Joined On:</strong> {new Date(profileData.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetProfilePage;

import React, { useState, useEffect } from "react";

const GetAboutUsPage = () => {
  const [aboutUsData, setAboutUsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        const response = await fetch("http://194.164.148.244:4061/api/admin/getaboutus");
        const data = await response.json();

        if (response.ok) {
          setAboutUsData(data);
        } else {
          setError(data.message || "Failed to fetch About Us data.");
        }
      } catch (err) {
        console.error("Error fetching About Us data:", err);
        setError("An error occurred while fetching About Us data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUsData();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">About Us</h2>

      {loading ? (
        <div className="text-gray-500">Loading About Us information...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : aboutUsData ? (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">{aboutUsData.title}</h3>
          <p className="text-gray-700 mb-4">{aboutUsData.content}</p>
          <p className="text-sm text-gray-500">
            Published on: {new Date(aboutUsData.date).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="text-gray-500">No About Us data found.</div>
      )}
    </div>
  );
};

export default GetAboutUsPage;

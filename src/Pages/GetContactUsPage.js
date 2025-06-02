import React, { useState, useEffect } from "react";
import axios from "axios";

const GetContactUsPage = () => {
  const [contactUsData, setContactUsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContactUsData = async () => {
      try {
        const response = await axios.get("http://194.164.148.244:4061/api/admin/getcontactus");
        setContactUsData(response.data); // Expecting array
      } catch (err) {
        console.error("Error fetching contact messages:", err);
        setError("Failed to fetch contact messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchContactUsData();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Contact Us Messages</h2>

      {loading && <p>Loading contact messages...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && contactUsData.length === 0 && (
        <p className="text-gray-600">No messages found.</p>
      )}

      {!loading &&
        contactUsData.map((msg, index) => (
          <div
            key={msg._id}
            className="mb-6 p-4 border border-gray-200 rounded shadow-sm bg-gray-50"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Message {index + 1} from {msg.name}
            </h3>
            <p className="text-sm text-gray-600">Email: {msg.email}</p>
            <p className="text-sm text-gray-600">Subject: {msg.subject}</p>
            <p className="text-gray-800 my-2">Message: {msg.message}</p>
            <p className="text-xs text-gray-500">
              Submitted on: {new Date(msg.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
    </div>
  );
};

export default GetContactUsPage;

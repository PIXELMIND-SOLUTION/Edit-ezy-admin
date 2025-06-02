import React, { useState, useEffect } from "react";
import axios from "axios";

const PrivacyPolicyPage = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios.get("http://194.164.148.244:4061/api/admin/getpolicy");
        setPrivacyPolicy(response.data);
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
        setError("Failed to load privacy policy.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold text-blue-900 mb-4">{privacyPolicy.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        Effective Date: {new Date(privacyPolicy.date).toLocaleDateString()}
      </p>
      <div className="text-gray-700 leading-relaxed text-lg space-y-4 whitespace-pre-line">
        {privacyPolicy.content}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

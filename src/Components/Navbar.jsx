import { useState, useEffect } from "react";
import { MdShoppingCart } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();

  // New state for redemption requests
  const [redemptionCount, setRedemptionCount] = useState(0);

  // Fetch redemption request count
  useEffect(() => {
    const fetchRedemptionRequests = async () => {
      try {
        const response = await axios.get("http://31.97.206.144:4061/api/admin/getredemption-requests");
        setRedemptionCount(response.data.requests?.length || 0); // Check if response.data.requests exists
      } catch (error) {
        console.error("Error fetching redemption requests:", error);
      }
    };

    fetchRedemptionRequests();
  }, []);

  const handleRedemptionClick = () => {
    navigate("/redemptions"); // Or whatever route you want
  };

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-blue-800 text-white sticky top-0 w-full p-3 flex items-center shadow-lg z-50">
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-xl p-2">
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-[#AAAAAA]" />
        ) : (
          <RiMenu3Line className="text-2xl text-[#AAAAAA]" />
        )}
      </button>

      <div className="flex justify-between items-center w-full">
        {/* Left Side Placeholder */}
        <div className="flex gap-6 ml-4 items-center">

          {/* 🔴 Redemption Requests Button with Count */}
          <button
            onClick={handleRedemptionClick}
            className="relative px-3 py-1 bg-black-700 hover:bg-blue-600 rounded text-xl flex items-center gap-1"
          >
            Redemption Requests
            {redemptionCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {redemptionCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Side Vendor Logo */}
        <div className="flex gap-3 items-center">
          <div className="flex flex-col justify-center items-center">
            <img
              className="rounded-full w-[3vw]"
              src="https://mir-s3-cdn-cf.behance.net/projects/original/ec753e129429523.61a1e79332f16.png"
              alt="Vendor Logo"
            />
            <h1 className="text-xs text-white">Poster Banavo</h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

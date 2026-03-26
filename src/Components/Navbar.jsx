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
    <nav className="sticky top-0 w-full p-3 flex items-center shadow-2xl z-50 backdrop-blur-xl border-b border-white/20"
      style={{
        background: "linear-gradient(135deg, rgba(31, 41, 55, 0.85), rgba(59, 130, 246, 0.75))",
        backdropFilter: "blur(12px)",
      }}
    >
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-xl p-2 transition-all duration-300 hover:scale-110">
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-white/80 hover:text-white" />
        ) : (
          <RiMenu3Line className="text-2xl text-white/80 hover:text-white" />
        )}
      </button>

      <div className="flex justify-between items-center w-full">
        {/* Left Side Placeholder */}
        <div className="flex gap-6 ml-4 items-center">

          {/* 🔴 Redemption Requests Button with Count */}
          <button
            onClick={handleRedemptionClick}
            className="relative px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 border border-white/20"
          >
            <span className="text-sm">Redemption Requests</span>
            {redemptionCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center animate-pulse shadow-lg">
                {redemptionCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Side Vendor Logo */}
        <div className="flex gap-3 items-center">
          <div className="flex flex-col justify-center items-center group cursor-pointer transition-all duration-300 hover:scale-105">
            <div className="relative">
              <img
                className="rounded-full w-[3vw] min-w-[40px] border-2 border-white/30 group-hover:border-white/60 transition-all duration-300"
                src="https://mir-s3-cdn-cf.behance.net/projects/original/ec753e129429523.61a1e79332f16.png"
                alt="Vendor Logo"
              />
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h1 className="text-xs text-white/80 group-hover:text-white transition-colors duration-300 mt-1 font-medium">Poster Banavo</h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
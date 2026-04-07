import { useState, useEffect } from "react";
import { MdShoppingCart } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { FaExpand, FaCompress } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();
  const [redemptionCount, setRedemptionCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch redemption request count
  useEffect(() => {
    const fetchRedemptionRequests = async () => {
      try {
        const response = await axios.get("http://31.97.206.144:4061/api/admin/getredemption-requests");
        setRedemptionCount(response.data.requests?.length || 0);
      } catch (error) {
        console.error("Error fetching redemption requests:", error);
      }
    };
    fetchRedemptionRequests();
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleRedemptionClick = () => {
    navigate("/redemptions");
  };

  return (
    <nav
      className="sticky top-0 w-full p-3 flex items-center shadow-2xl z-50 border-b border-white/20"
      style={{
        backgroundImage: "url('https://img.freepik.com/free-photo/hand-painted-watercolor-background-with-sky-clouds-shape_24972-1095.jpg?t=st=1746429807~exp=1746433407~hmac=e3434110c0769d2ad42bd54e0534379335887da5831a723df88f4f74891e28d2&w=1380')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay + blur for glassmorphism */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md pointer-events-none"></div>

      <div className="relative w-full flex items-center justify-between z-10">
        {/* Left side - collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xl p-2 transition-all duration-300 hover:scale-110 focus:outline-none"
        >
          {isCollapsed ? (
            <RiMenu2Line className="text-2xl text-white/90 hover:text-white" />
          ) : (
            <RiMenu3Line className="text-2xl text-white/90 hover:text-white" />
          )}
        </button>

        {/* Center / Right area */}
        <div className="flex items-center gap-4">
          {/* Redemption Requests Button */}
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

          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="text-white text-xl p-2 hover:scale-110 transition-transform focus:outline-none bg-white/10 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center border border-white/20"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>

          {/* Vendor Logo - Using new image */}
          <div className="flex flex-col justify-center items-center group cursor-pointer transition-all duration-300 hover:scale-105">
            <div className="relative">
              <img
                className="rounded-full w-[3vw] min-w-[40px] border-2 border-white/30 group-hover:border-white/60 transition-all duration-300 object-cover"
                src="https://editezy.com/Subtract.png"
                alt="EDITEZY Logo"
              />
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h1 className="text-xs text-white/90 group-hover:text-white transition-colors duration-300 mt-1 font-medium">
              EDITEZY
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://31.97.206.144:4061";
      await axios.post(`${apiUrl}/api/admin/logout`, {}, { withCredentials: true });
      localStorage.removeItem("authToken");
      alert("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-dashboard-fill text-white"></i>,
      name: "Admin Panel",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-fill text-white"></i>,
      name: "Users",
      dropdown: [
        { name: "User List", path: "/users" },
        { name: "User ContactedList", path: "/usercontactedlist" },
        { name: "User Redemtion List", path: "/redemptions" },
      ],
    },
    {
      icon: <i className="ri-flag-fill text-white"></i>,
      name: "Reports",
      dropdown: [
        { name: "Reported Users", path: "/reported-users" }
      ],
    },
    {
      icon: <i className="ri-image-fill text-white"></i>,
      name: "Categories",
      dropdown: [
        { name: "Get All Categories", path: "/categorylist" },
      ],
    },
    {
      icon: <i className="ri-image-fill text-white"></i>,
      name: "Posters",
      dropdown: [
        { name: "Create Poster", path: "/create-poster" },
        { name: "Get All Posters", path: "/posterlist" },
      ],
    },
    {
      icon: <i className="ri-video-fill text-white"></i>,
      name: "Reels",
      dropdown: [
        { name: "Manage Reels", path: "/reels" },
      ],
    },
    {
      icon: <i className="ri-music-fill text-white"></i>,
      name: "Audio",
      dropdown: [
        { name: "Manage Audio", path: "/audio" },
      ],
    },
    {
      icon: <i className="ri-palette-fill text-white"></i>,
      name: "Logos",
      dropdown: [
        { name: "Logo Category", path: "/create-logocategory" },
        { name: "Create Logo", path: "/create-logo" },
        { name: "Get All Logos", path: "/logolist" },
      ],
    },
     {
      icon: <i className="ri-palette-fill text-white"></i>,
      name: "Business Cards",
      dropdown: [
        { name: "Business Cards", path: "/business" },
        { name: "Business CardsList", path: "/businesscardlist" },
      ],
    },
    {
      icon: <i className="ri-sticker-fill text-white"></i>,
      name: "Stickers",
      dropdown: [
        { name: "Sticker Category", path: "/stickers-category" },
        { name: "Create Sticker", path: "/create-sticker" },
        { name: "Get All Stickers", path: "/create-sticker" },
      ],
    },
     {
      icon: <i className="ri-gift-fill text-white"></i>,
      name: "Celebration",
      dropdown: [
        { name: "Celebration", path: "/celebration" },
      ],
    },
    {
      icon: <i className="ri-gallery-fill text-white"></i>,
      name: "Banners",
      dropdown: [
        { name: "Banner", path: "/banner" },
      ],
    },
    {
      icon: <i className="ri-file-list-fill text-white"></i>,
      name: "Subscription Plans",
      dropdown: [
        { name: "Create Plan", path: "/create-plan" },
        { name: "Get All Plans", path: "/planlist" },
        { name: "Purchased Plans", path: "/userplanlist" },
        { name: "User Payments", path: "/paymentlist" },
      ],
    },
    {
      icon: <i className="ri-wallet-fill text-white"></i>,
      name: "Set User Wallet",
      path: "/userwallet",
    },
    {
      icon: <i className="ri-money-rupee-circle-fill text-white"></i>,
      name: "Amount Config",
      path: "/amount-config",
    },
    {
      icon: <i className="ri-settings-3-fill text-white"></i>,
      name: "Settings",
      dropdown: [
        { name: "Create Privacy & Policy", path: "/create-privacy" },
        { name: "Get Privacy & Policy", path: "/get-policy" },
        { name: "Create AboutUs", path: "/aboutus" },
        { name: "Get AboutUs", path: "/getaboutus" },
        { name: "Create ContactUs", path: "/contactus" },
        { name: "Get ContactUs", path: "/getcontactus" },
        { name: "Profile", path: "/profile" },
      ],
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-500 ${
        isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
      } h-screen overflow-y-auto no-scrollbar flex flex-col backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl`}
      style={{
        background: "linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(59, 130, 246, 0.85))",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="sticky top-0 z-10 p-4 font-bold text-white flex justify-center text-xl bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <span className="tracking-wider">Admin Panel</span>
      </div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-2 mt-4 px-3 pb-6`}>
        {elements.map((item, idx) => (
          <div key={idx} className="w-full">
            {item.dropdown ? (
              <>
                <div
                  className="group flex items-center py-3 px-3 font-medium text-sm text-white rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm hover:bg-white/20 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <span className={`ml-3 flex-1 ${isCollapsed && !isMobile ? "hidden" : "block"} tracking-wide`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`text-xs transition-all duration-300 ${
                      openDropdown === item.name ? "rotate-180" : "rotate-0"
                    } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                  />
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openDropdown === item.name ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className={`ml-8 mt-1 space-y-1 ${isCollapsed && !isMobile ? "ml-0" : ""}`}>
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 px-2 font-medium text-white/80 rounded-lg transition-all duration-300 hover:bg-white/20 hover:text-white hover:translate-x-1"
                          onClick={() => setOpenDropdown(null)}
                          style={{ textDecoration: "none" }}
                        >
                          <span className="text-sm opacity-70">✦</span>
                          <span className="text-sm" style={{ textDecoration: "none" }}>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <Link
                to={item.path}
                className="group flex items-center py-3 px-3 font-medium text-sm text-white rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/20 hover:shadow-lg hover:scale-[1.02]"
                onClick={item.action ? item.action : null}
                style={{ textDecoration: "none" }}
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                <span className={`ml-3 ${isCollapsed && !isMobile ? "hidden" : "block"} tracking-wide`} style={{ textDecoration: "none" }}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <style jsx>{`
        /* Remove all underlines from links */
        a {
          text-decoration: none !important;
        }
        a:hover {
          text-decoration: none !important;
        }
        /* Custom scrollbar for glassmorphism */
        .no-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .no-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
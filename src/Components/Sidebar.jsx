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
      // Get API URL based on environment
      const apiUrl = process.env.REACT_APP_API_URL || "http://31.97.206.144:4061";

      // Make the POST request to the logout API
      await axios.post(`${apiUrl}/api/admin/logout`, {}, { withCredentials: true });

      // Remove the token from localStorage
      localStorage.removeItem("authToken");

      // Alert the user and redirect to login
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
        { name: "Get All Stickers", path: "/stickerlist" },
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
      className={`transition-all duration-300 ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"} h-screen overflow-y-scroll no-scrollbar flex flex-col bg-gradient-to-b from-gray-800 to-blue-800`}
    >
      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl bg-[#1F2937] border-b border-gray-700">
        <span>Admin Panel</span>
      </div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg cursor-pointer no-underline"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${openDropdown === item.name ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm text-white">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium cursor-pointer hover:text-[#00B074] hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
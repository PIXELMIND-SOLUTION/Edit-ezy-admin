import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUsers,
  FiGift,
  FiHeart,
  FiCreditCard,
  FiImage,
  FiGrid,
  FiLayout,
  FiFileText,
  FiUserCheck,
} from "react-icons/fi";
import {
  Container,
  Row,
  Col,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem,
  Spinner,
} from "reactstrap";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("http://31.97.228.17:4061/api/admin/dashboard");
        setDashboardData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p>Loading dashboard...</p>
      </div>
    );

  if (!dashboardData)
    return (
      <div className="text-center my-5 text-danger">
        Failed to load data
      </div>
    );

  const {
    totalUsersCount,
    totalPosters,
    totalCategories,
    totalBanners,
    totalLogos,
    totalActiveSubscriptions,
    activeUsersCount,
    birthdayUsers,
    anniversaryUsers,
    planSummary,
  } = dashboardData;

  const topStats = [
    { label: "Total Users", value: totalUsersCount, icon: FiUsers, path: "/users", gradientColor: "#3b82f6" },
    { label: "Total Posters", value: totalPosters, icon: FiImage, path: "/posterlist", gradientColor: "#a855f7" },
    { label: "Total Categories", value: totalCategories, icon: FiGrid, path: "/categorylist", gradientColor: "#f43f5e" },
    { label: "Total Banners", value: totalBanners, icon: FiLayout, path: "/banner", gradientColor: "#f59e0b" },
    { label: "Total Logos", value: totalLogos, icon: FiFileText, path: "/logolist", gradientColor: "#6366f1" },
    { label: "Active Subscriptions", value: totalActiveSubscriptions, icon: FiCreditCard, path: "/paymentlist", gradientColor: "#10b981" },
    { label: "Active Users", value: activeUsersCount, icon: FiUserCheck, path: "/users", gradientColor: "#ef4444" },
  ];

  return (
    <div className="min-vh-100 py-4 px-3" style={{ background: "#f8fafc" }}>
      <Container className="my-4">
        {/* TOP STATS - Liquid Morphism + Animated */}
        <Row className="mb-4">
          {topStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Col sm="6" md="4" lg="3" key={index} className="mb-3">
                <div
                  className="liquid-card cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  onClick={() => navigate(stat.path)}
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(16px)",
                    borderRadius: "1.5rem",
                    border: "1px solid rgba(255,255,255,0.5)",
                    overflow: "hidden",
                    position: "relative",
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Animated gradient border */}
                  <div
                    className="absolute inset-0 rounded-2xl p-[2px] opacity-80 animate-border-flow"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${stat.gradientColor}, transparent)`,
                      backgroundSize: "200% 100%",
                      animation: "borderFlow 3s linear infinite",
                      pointerEvents: "none",
                    }}
                  />
                  <CardBody className="text-center p-4" style={{ background: "transparent" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Icon size={32} style={{ color: stat.gradientColor }} />
                      <CardTitle tag="h6" className="mb-0 fw-semibold" style={{ color: "#1e293b" }}>
                        {stat.label}
                      </CardTitle>
                    </div>
                    <h2 className="fw-bold text-3xl" style={{ color: "#0f172a" }}>
                      {stat.value}
                    </h2>
                  </CardBody>
                </div>
              </Col>
            );
          })}
        </Row>

        {/* BIRTHDAYS + ANNIVERSARIES + PLANS - Liquid Morphism */}
        <Row>
          <Col md="4" className="mb-3">
            <div
              className="liquid-card h-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              onClick={() => navigate("/admin/birthdays")}
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(16px)",
                borderRadius: "1.5rem",
                border: "1px solid rgba(255,255,255,0.5)",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              }}
            >
              <CardBody className="p-4" style={{ background: "transparent" }}>
                <div className="d-flex align-items-center mb-3">
                  <FiGift size={36} className="text-pink-500 me-3" />
                  <h5 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Today's Birthdays</h5>
                </div>
                {birthdayUsers.length === 0 ? (
                  <p className="text-muted">No birthdays today.</p>
                ) : (
                  birthdayUsers.map((user, i) => (
                    <div key={user._id || i} className="d-flex justify-content-between mb-2">
                      <div>
                        <strong>{user.name}</strong>{" "}
                        <small className="text-muted">({user.dob})</small>
                      </div>
                      <span className="text-pink-500">🎉</span>
                    </div>
                  ))
                )}
              </CardBody>
            </div>
          </Col>

          <Col md="4" className="mb-3">
            <div
              className="liquid-card h-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              onClick={() => navigate("/admin/anniversaries")}
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(16px)",
                borderRadius: "1.5rem",
                border: "1px solid rgba(255,255,255,0.5)",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              }}
            >
              <CardBody className="p-4" style={{ background: "transparent" }}>
                <div className="d-flex align-items-center mb-3">
                  <FiHeart size={36} className="text-rose-500 me-3" />
                  <h5 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Anniversaries</h5>
                </div>
                {anniversaryUsers.length === 0 ? (
                  <p className="text-muted">No anniversaries today.</p>
                ) : (
                  anniversaryUsers.map((user, i) => (
                    <div key={user._id || i} className="d-flex justify-content-between mb-2">
                      <div>
                        <strong>{user.name}</strong>{" "}
                        <small className="text-muted">({user.marriageAnniversaryDate})</small>
                      </div>
                      <span className="text-rose-500">💞</span>
                    </div>
                  ))
                )}
              </CardBody>
            </div>
          </Col>

          <Col md="4" className="mb-3">
            <div
              className="liquid-card h-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              onClick={() => navigate("/admin/plans")}
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(16px)",
                borderRadius: "1.5rem",
                border: "1px solid rgba(255,255,255,0.5)",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              }}
            >
              <CardBody className="p-4" style={{ background: "transparent" }}>
                <div className="d-flex align-items-center mb-3">
                  <FiCreditCard size={36} className="text-emerald-500 me-3" />
                  <h5 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Subscription Plans</h5>
                </div>
                {Object.keys(planSummary).length === 0 ? (
                  <p className="text-muted">No active subscriptions.</p>
                ) : (
                  <ListGroup flush>
                    {Object.entries(planSummary).map(([plan, count], i) => (
                      <ListGroupItem
                        key={i}
                        className="d-flex justify-content-between px-0 bg-transparent border-0"
                      >
                        <span className="fw-bold">{plan}</span>
                        <small className="text-muted">{count} Users</small>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                )}
              </CardBody>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Keyframe animations */}
      <style>
        {`
          @keyframes borderFlow {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
          .animate-border-flow {
            animation: borderFlow 3s linear infinite;
          }
          .liquid-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .liquid-card:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 20px 35px -10px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
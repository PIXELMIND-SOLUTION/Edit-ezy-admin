import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiGift,
  FiHeart,
  FiCreditCard,
} from "react-icons/fi";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem,
  Spinner,
} from "reactstrap";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("http://31.97.206.144:4061/api/admin/dashboard");
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
    { label: "Total Users", value: totalUsersCount, bg: "#E0F2FE", color: "#0284C7" },
    { label: "Total Posters", value: totalPosters, bg: "#EDE9FE", color: "#7C3AED" },
    { label: "Total Categories", value: totalCategories, bg: "#FCE7F3", color: "#BE185D" },
    { label: "Total Banners", value: totalBanners, bg: "#FEF9C3", color: "#CA8A04" },
    { label: "Total Logos", value: totalLogos, bg: "#E0E7FF", color: "#4338CA" },
    { label: "Active Subscriptions", value: totalActiveSubscriptions, bg: "#D1FAE5", color: "#059669" },
    { label: "Active Users", value: activeUsersCount, bg: "#FEF2F2", color: "#DC2626" },
  ];

  return (
    <Container className="my-4">
      {/* TOP STATS */}
      <Row className="mb-4">
        {topStats.map((stat, index) => (
          <Col sm="6" md="4" lg="3" key={index} className="mb-3">
            <Card style={{ backgroundColor: stat.bg, border: "none" }} className="shadow-sm">
              <CardBody className="text-center">
                <CardTitle tag="h6" className="mb-1" style={{ color: stat.color }}>
                  {stat.label}
                </CardTitle>
                <h2 className="fw-bold" style={{ color: stat.color }}>{stat.value}</h2>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* BIRTHDAYS + ANNIVERSARIES + PLANS */}
      <Row>
        <Col md="4" className="mb-3">
          <Card className="shadow-sm h-100">
            <CardBody>
              <div className="d-flex align-items-center mb-3">
                <FiGift size={36} className="text-pink-600 bg-pink-100 rounded p-2 me-2" />
                <h5 className="mb-0 fw-bold">Today's Birthdays</h5>
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
                    <span className="text-pink-600">🎉</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </Col>

        <Col md="4" className="mb-3">
          <Card className="shadow-sm h-100">
            <CardBody>
              <div className="d-flex align-items-center mb-3">
                <FiHeart size={36} className="text-danger bg-danger bg-opacity-10 rounded p-2 me-2" />
                <h5 className="mb-0 fw-bold">Anniversaries</h5>
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
                    <span className="text-danger">💞</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </Col>

        <Col md="4" className="mb-3">
          <Card className="shadow-sm h-100">
            <CardBody>
              <div className="d-flex align-items-center mb-3">
                <FiCreditCard size={36} className="text-success bg-success bg-opacity-10 rounded p-2 me-2" />
                <h5 className="mb-0 fw-bold">Subscription Plans</h5>
              </div>
              {Object.keys(planSummary).length === 0 ? (
                <p className="text-muted">No active subscriptions.</p>
              ) : (
                <ListGroup flush>
                  {Object.entries(planSummary).map(([plan, count], i) => (
                    <ListGroupItem key={i} className="d-flex justify-content-between px-0">
                      <span className="fw-bold">{plan}</span>
                      <small className="text-muted">{count} Users</small>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

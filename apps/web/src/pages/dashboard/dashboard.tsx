import Hsidebar from "../../components/dashboard/hsidebar";

const Dashboard = () => {
  return (
    <Hsidebar>
      <div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Dashboard Content Here
        </h1>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>
          Your main content goes here
        </p>
        {/* Add your dashboard widgets, charts, etc. here */}
      </div>
    </Hsidebar>
  );
};

export default Dashboard;

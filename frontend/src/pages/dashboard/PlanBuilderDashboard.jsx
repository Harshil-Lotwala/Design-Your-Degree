import React from "react";
import "./PlanBuilderDashboard.css";

function PlanBuilderDashboard() {

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">Dashboard</h1>

      <section className="degree-overview-box">
        <div className="overview-placeholder">[ Degree Overview ]</div>
      </section>

      <p className="overview-label">Degree Overview</p>

      <section className="major-minor-section">
        <section className="summary-card">
          <p><strong>GPA:</strong> --</p>
          <p><strong>Credits Earned:</strong> --</p>
          <p><strong>Progress:</strong> [ Progress Bar Placeholder ]</p>
        </section>

        <section className="dropdown-container">
          <div className="dropdown-group">
            <label htmlFor="major-select">Major:</label>
            <select id="major-select">
              <option value="">Select Major</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Applied Computer Science">Applied Computer Science</option>
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="minor-select">Minor:</label>
            <select id="minor-select">
              <option value="">Select Minor</option>
              <option value="management">Management</option>
              <option value="Psychology">Psychology</option>
              <option value="Business">Business</option>
              <option value="Physics">Physics</option>
            </select>
          </div>
        </section>
      </section>
    </div>
  );
}

export default PlanBuilderDashboard;
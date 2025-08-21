import React from "react";
import "./CourseCard.css";

export default function CourseCard({ course, onStatusChange }) {
  if (!course) return null;

  const { type, status } = course;

  // Determine class for course type badge
  const typeClass = type ? (type.toLowerCase() === "core" ? "core-badge" : "elective-badge") : "";

  // Determine class for status badge, converting to lowercase and replacing spaces with dashes
  const statusClass = status
    ? `status-badge ${status.toLowerCase().replace(/\s+/g, "-")}`
    : "";

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    onStatusChange(course.id, newStatus);
  };

  return (
    <article className="course-card">
      <h3 className="course-code">{course.code}</h3>
      <div className="tile-row">
        <span className={`course-type ${typeClass}`}>{type || "Unspecified"}</span>
        {status && <span className={statusClass}>{status}</span>}
        <select value={status || "Remaining"} onChange={handleStatusChange} className="status-select">
          <option value="Remaining">Remaining</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </article>
  );
}


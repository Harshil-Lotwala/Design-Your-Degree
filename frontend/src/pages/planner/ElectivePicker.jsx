import React from "react";
import "./DegreePlanner.css";

const mockElectives = [
    { code: "PSYO 1012", title: "Intro to Psychology"},
    { code: "MGMT 2801", title: "Governmnet Structures"},
    { code: "STAT 1010", title: "Statistics"},
];

export default function ElectivePicker() {
    return (
        <section className="section-container">
  <h2>Pick an Elective</h2>
  <form>
    <label htmlFor="elective-select">Choose an elective:</label>
    <select id="elective-select">
      <option value="">--select a course--</option>
      {mockElectives.map((course) => (
        <option key={course.code} value={course.code}>
          {course.code} - {course.title}
        </option>
      ))}
    </select>
    <button type="button">Add Elective</button>
  </form>
</section>

    );
}
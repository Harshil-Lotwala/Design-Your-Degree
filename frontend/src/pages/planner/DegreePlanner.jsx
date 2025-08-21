import React, { useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import CourseCard from "./CourseCard.jsx";
import OptionForm from "./OptionForm.jsx";
import ElectivePicker from "./ElectivePicker.jsx";
import CoursePicker from "./CoursePicker.jsx";
import "./DegreePlanner.css";

const API_URL = "http://127.0.0.1:5000";

// Group terms by academic year
const termStructureByYear = {
  2023: ["Fall 2023", "Winter 2023", "Summer 2023"],
  2024: ["Fall 2024", "Winter 2024", "Summer 2024"],
  2025: ["Fall 2025", "Winter 2025", "Summer 2025"],
  2026: ["Fall 2026", "Winter 2026", "Summer 2026"],
  2027: ["Fall 2027", "Winter 2027", "Summer 2027"],
};

// Initialize empty course arrays for each term
const generateEmptyTermStructure = () => {
  const empty = {};
  Object.values(termStructureByYear).flat().forEach((term) => {
      empty[term] = [];
    });
  return empty;
};

//Inline print styling for the printable view 
const printStyles = `body { font-family: Arial, sans-serif; padding: 20px; }
      .term-column { border: 1px solid #ccc; margin: 10px; padding: 10px; }
      .term-heading { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
      .course-list { margin-left: 15px; }
      .course-card { padding: 4px 0; }`;

export default function DegreePlanner() {
  const [terms, setTerms] = useState(generateEmptyTermStructure());
  const [activeYear, setActiveYear] = useState(2023);
  const [selectedTermSeason, setSelectedTermSeason] = useState("Fall");
  const [, setTermMappings] = useState({});
  const [filterStatus, setFilterStatus] = useState("All"); 
  const printRef = useRef();

  useEffect(() => {
    fetch(`${API_URL}/terms`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapping = {};
          data.forEach((term) => {
            mapping[term.term_name] = term.term_id;
          });
          setTermMappings(mapping);
        }
      })
      .catch((err) => console.error("Failed to fetch terms", err));

    // Load user's courses with statuses
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`${API_URL}/api/user-courses/${userId}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // Group courses by term and add them to the terms state
            const newTerms = { ...generateEmptyTermStructure() };
            data.forEach((course) => {
              if (newTerms[course.term_name]) {
                const prefixMap = { Fall: "f", Winter: "w", Summer: "s" };
                const season = course.term_name.split(" ")[0];
                const termPrefix = prefixMap[season] || "x";
                const nextId = `${termPrefix}${newTerms[course.term_name].length + 1}`;
                
                newTerms[course.term_name].push({
                  id: nextId,
                  code: course.code,
                  name: course.name,
                  type: course.type,
                  status: course.status || "Remaining",
                  subject_id: course.subject_id
                });
              }
            });
            setTerms(newTerms);
          }
        })
        .catch((err) => console.error("Failed to fetch user courses", err));
    }
  }, []);

  // print handler
  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open("", "", "width=1000,height=800");
    printWindow.document.write("<html><head><title>Print Degree Plan</title>");
    printWindow.document.write(`<style>${printStyles}</style></head><body>`  );
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // drag and drop logic
  const onDragEnd = ({ source, destination }) => {
    if (!destination || (source.droppableId === destination.droppableId &&
      source.index === destination.index)) return;

    const sourceList = [...terms[source.droppableId]];
    const destinationList = [...terms[destination.droppableId]];
    const [movedItem] = sourceList.splice(source.index, 1);
    destinationList.splice(destination.index, 0, movedItem);

    setTerms((prev) => ({
      ...prev,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destinationList,
    }));
  };

 // add course to selected term - backend persistence is handled by CoursePicker
  const handleCourseAdd = (newCourse) => {
    const term = `${selectedTermSeason} ${activeYear}`;
    const prefixMap = { Fall: "f", Winter: "w", Summer: "s" };
    const termPrefix = prefixMap[selectedTermSeason] || "x";
    const courseList = terms[term] || [];
    const nextId = `${termPrefix}${courseList.length + 1}`;

    const courseExists = Object.values(terms).some((termCourses) =>
      termCourses.some((c) => c.code === newCourse.code)
    );

    if (courseExists) {
      alert("Course already added to another semester.");
      return;
    }

    // Ensure the course has all required fields including subject_id
    const courseWithId = { 
      ...newCourse, 
      id: nextId,
      subject_id: newCourse.id || newCourse.subject_id, // CoursePicker passes id as subject_id
      status: newCourse.status || "Remaining" // Default status if not provided
    };

    setTerms((prev) => ({
      ...prev,
      [term]: [...courseList, courseWithId],
    }));

    console.log("Course added to term:", courseWithId);
  };

  // Handle status change for a course
  const handleStatusChange = async (courseId, newStatus) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("Please log in to update course status.");
      return;
    }

    // Find the course in terms to get its subject_id
    let targetCourse = null;
    let targetTerm = null;
    
    for (const [termName, courses] of Object.entries(terms)) {
      const found = courses.find(course => course.id === courseId);
      if (found) {
        targetCourse = found;
        targetTerm = termName;
        break;
      }
    }

    if (!targetCourse || !targetCourse.subject_id) {
      console.error("Course not found or missing subject_id");
      return;
    }

    try {
      const payload = {
        user_id: userId,
        subject_id: targetCourse.subject_id,
        status: newStatus,
      };

      const res = await fetch(`${API_URL}/api/update-course-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Update the local state
        setTerms(prev => ({
          ...prev,
          [targetTerm]: prev[targetTerm].map(course => 
            course.id === courseId 
              ? { ...course, status: newStatus }
              : course
          )
        }));
        console.log("Status updated successfully");
      } else {
        const error = await res.json();
        console.error("Failed to update status:", error.message);
        alert("Failed to update course status. Please try again.");
      }
    } catch (err) {
      console.error("Error updating course status:", err);
      alert("Error updating course status. Please try again.");
    }
  };

  return (
    <main className="planner-container">
      <h1 className="planner-title">Degree Planner</h1>

      {/* course picker section */}
      <div className="picker-wrapper">
        <h2 className="picker-heading">Add a Course</h2>
        <div className="term-picker-container">
          <label htmlFor="term-select">Select Term:</label>
          <select
            id="term-select"
            value={selectedTermSeason}
            onChange={(e) => setSelectedTermSeason(e.target.value)}
          >
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Summer">Summer</option>
          </select>
        </div>

        <div className="filter-container">
          <label>Filter by Status:{" "}
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All</option>
              <option value="Remaining">Remaining</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
        </div>

        <CoursePicker
          onCourseSelect={handleCourseAdd}
          selectedCourseCodes={Object.values(terms).flat().map((c) => c.code)}
          terms={terms}
          setTerms={setTerms}
          selectedTermSeason={selectedTermSeason}
          activeYear={activeYear}
          filterStatus ={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>

      {/* year tabs + print */}
      <div className="year-tabs">
        {Object.keys(termStructureByYear).map((year) => (
          <button
            key={year}
            className={`year-tab ${activeYear === +year ? "active" : ""}`}
            onClick={() => setActiveYear(+year)}
          >
            {year}
          </button>
        ))}
        <button className="print-button" onClick={handlePrint}>
          Print Degree Plan
        </button>
      </div>

      {/* planner grid */}
      <div ref={printRef}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="term-grid">
            {termStructureByYear[activeYear].map((termName) => (
              <Droppable droppableId={termName} key={termName}>
                {(provided) => (
                  <div
                    className="term-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3 className="term-heading">{termName}</h3>
                    <div className="course-list">
                      {(terms[termName] || []).filter(course => {
                        if (filterStatus ==="All") return true;
                        return course.status === filterStatus;
                      })           
                      .map((course,index) => (
                        <Draggable
                          key={course.id}
                          draggableId={course.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <CourseCard course={course} onStatusChange={handleStatusChange} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
        
      {/* supplementary tools  */}
      <ElectivePicker />
      <OptionForm />
    </main>
  );
}
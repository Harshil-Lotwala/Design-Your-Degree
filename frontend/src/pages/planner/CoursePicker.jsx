import React, { useEffect, useState } from "react";

const API_URL = "https://design-your-degree.research.cs.dal.ca/api";

export default function CoursePicker({
  terms,
  setTerms,
  selectedTermSeason,
  activeYear,
  filterStatus,
  setFilterStatus,
  onCourseSelect
}) {
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const selectedTerm = `${selectedTermSeason} ${activeYear}`;
  
  // Helper function to suggest next available term
  const getNextTerm = (currentTerm) => {
    const [season, year] = currentTerm.split(' ');
    const yearNum = parseInt(year);
    
    const seasonOrder = { 'Fall': 0, 'Winter': 1, 'Summer': 2 };
    const seasonNames = ['Fall', 'Winter', 'Summer'];
    
    const currentSeasonIndex = seasonOrder[season];
    
    if (currentSeasonIndex === 2) { // Summer -> next Fall
      return `Fall ${yearNum + 1}`;
    } else {
      return `${seasonNames[currentSeasonIndex + 1]} ${yearNum}`;
    }
  };
  
  // Helper function to find the earliest term after all prerequisites
  const suggestEarliestValidTerm = (prereqScheduling) => {
    let latestPrereqTerm = null;
    let latestTermOrder = -1;
    
    const getTermOrder = (termName) => {
      const [season, year] = termName.split(' ');
      const yearNum = parseInt(year);
      const seasonOrder = { 'Fall': 0, 'Winter': 1, 'Summer': 2 };
      return yearNum * 10 + seasonOrder[season];
    };
    
    prereqScheduling.forEach(prereq => {
      const termOrder = getTermOrder(prereq.current_term);
      if (termOrder > latestTermOrder) {
        latestTermOrder = termOrder;
        latestPrereqTerm = prereq.current_term;
      }
    });
    
    return latestPrereqTerm ? getNextTerm(latestPrereqTerm) : null;
  };

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch(`${API_URL}/subjects`);
        const data = await response.json();
        console.log("courseData loaded:", data);
        if (Array.isArray(data)) {
          const formatted = data.map((c) => ({
            id: c.subject_id,           
            code: c.code,               
            name: c.name,
            type: c.type,
          }));
          setCourseData(formatted);
        } else {
          console.error("Expected array but got:", data);
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    }
    fetchCourses();
  }, []);

  // finish the term in which the given course code already exists
  const findCourseTerm = (code) => {
    for (const [term, courses] of Object.entries(terms)) {
      if (courses.some((c) => c.code === code)) {
        return term;
      }
    }
    return null;
  };

  // get term ID from term label
  async function getTermIdFromLabel(label) {
    try {
      const response = await fetch(`${API_URL}/terms`);
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Expected array, got:", data);
        return null;
      }
      const match = data.find((term) => term.term_name === label);
      return match ? match.term_id : null;
    } catch (err) {
      console.error("Failed to fetch term ID:", err);
      return null;
    }
  }

  // save selected course to database
  async function saveCourseToDB(userId, subjectId, termLabel) {
    const termId = await getTermIdFromLabel(termLabel);
    if (!termId) throw new Error("No matching term ID found");

    const response = await fetch(`${API_URL}/api/add-course`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        subject_id: subjectId,
        term_id: termId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save course");
    }

    return await response.json();
  }

  // handle course selection and assignment
  const handleSelect = async () => {
    if (!selectedCode || !["Remaining", "In Progress", "Completed"].includes(selectedStatus)) {
        alert("Please select a course and a valid status before adding."); 
        return; 
    }

    setLoading(true);
    setSuccess(false);
    setError(false);

    try {
      const course = courseData.find((c) => c.code === selectedCode);
      if (!course) throw new Error("Selected course not found");

      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("No user ID found");

      // Check prerequisites before adding the course
      try {
        const prereqResponse = await fetch(`${API_URL}/api/check-prerequisites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            subject_id: course.id,
            target_term: selectedTerm,
          }),
        });

        const prereqResult = await prereqResponse.json();
        
        if (!prereqResponse.ok) {
          // Show detailed prerequisite warning with suggestions
          let message = "⚠️ Prerequisite Issues Found:\n\n";
          let hasIssues = false;
          
          if (prereqResult.missing_prerequisites && prereqResult.missing_prerequisites.length > 0) {
            message += "❌ Missing Prerequisites (must be added first):\n";
            prereqResult.missing_prerequisites.forEach(prereq => {
              message += `   • ${prereq.code}: ${prereq.name}\n`;
            });
            message += "\n💡 Please add these prerequisite courses to your plan first.\n\n";
            hasIssues = true;
          }
          
          if (prereqResult.invalid_scheduling && prereqResult.invalid_scheduling.length > 0) {
            message += "⏰ Scheduling Conflicts (prerequisites must come before):\n";
            prereqResult.invalid_scheduling.forEach(prereq => {
              message += `   • ${prereq.code} is currently in ${prereq.current_term} (${prereq.status})\n`;
              message += `     but must be completed before ${selectedTerm}\n`;
            });
            
            // Suggest the earliest valid term
            const suggestedTerm = suggestEarliestValidTerm(prereqResult.invalid_scheduling);
            
            message += "\n💡 Suggestions:\n";
            message += "   - Move prerequisite courses to earlier terms, OR\n";
            if (suggestedTerm) {
              message += `   - Schedule this course in ${suggestedTerm} or later\n\n`;
            } else {
              message += `   - Schedule this course in a later term (after prerequisites)\n\n`;
            }
            hasIssues = true;
          }
          
          if (hasIssues) {
            message += "\n⚠️ RECOMMENDATION: Fix prerequisite issues first for proper academic progression.\n";
            message += "\nDo you still want to add this course anyway? (Not recommended)";
          }
          
          if (!window.confirm(message)) {
            setLoading(false);
            return;
          }
        }
      } catch (prereqError) {
        console.error("Error checking prerequisites:", prereqError);
        // Continue with adding the course if prerequisite check fails
      }

      const currentTerm = findCourseTerm(selectedCode);
      const updatedTerms = { ...terms };

      // remove course from its current term if it's being moved
      if (currentTerm && currentTerm !== selectedTerm) {
        updatedTerms[currentTerm] = updatedTerms[currentTerm].filter(
          (c) => c.code !== selectedCode
        );
      }

      // add course to the selected term if not already present
      if (!updatedTerms[selectedTerm].some((c) => c.code === selectedCode)) {
        const prefixMap = { Fall: "f", Winter: "w", Summer: "s" };
        const termPrefix = prefixMap[selectedTermSeason] || "x";
        const nextId = `${termPrefix}${updatedTerms[selectedTerm].length + 1}`;

        const courseWithId = { ...course, id: nextId, status:selectedStatus };
        updatedTerms[selectedTerm] = [...updatedTerms[selectedTerm], courseWithId];
        setTerms(updatedTerms);

        const saveResult = await saveCourseToDB(userId, course.id, selectedTerm);
        console.log("Course saved successfully:", saveResult);
        setSuccess(true);

        if (onCourseSelect) {
          onCourseSelect(courseWithId);
        }
      }
    } catch (e) {
      console.error("Error in handleSelect:", e.message);
      setError(true);
    } finally {
      setLoading(false);
      setSelectedCode("");
      setSelectedStatus("");
    }
  };

  return (
    <div className="picker-container">
      <select
        value={selectedCode}
        onChange={(e) => setSelectedCode(e.target.value)}
      >
        <option value="">-- Select a Course --</option>
        {Array.isArray(courseData) &&
          courseData.map((course) => {
            const alreadyInTerm = findCourseTerm(course.code);
            return (
              <option
                key={course.code}
                value={course.code}
                style={{
                  color: alreadyInTerm ? "#9ca3af" : "#111827",
                  backgroundColor: alreadyInTerm ? "#f3f4f6" : "white",
                }}
              >
                {course.code} - {course.name}
                {alreadyInTerm ? ` (in ${alreadyInTerm})` : ""}
              </option>
            );
          })}
      </select>
      
      {/* status dropdown */}
      <label>
        <select value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">-- Set Course Status --</option>
          <option value="Remaining">Remaining</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </label>
    
    <div className="add-course-actions">
      <button onClick={handleSelect} disabled={!selectedCode}>
        {findCourseTerm(selectedCode) ? "Move Course" : "Add Course"}
      </button>

      {loading && (
        <p style={{ color: "blue", marginTop: "10px" }}>Adding course...</p>
      )}
      {success && (
        <p style={{ color: "green", marginTop: "10px" }}>Course added!</p>
      )}
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          Failed to add course. Try again.
        </p>
      )}

      {courseData.length === 0 && (
        <p style={{ color: "red", marginTop: "10px" }}>
          No courses loaded. Please check your backend or refresh.
        </p>
      )}
    </div>
    </div>
  );
}

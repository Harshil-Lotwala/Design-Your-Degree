import React from "react";
import "./DegreePlanner.css";

const mockOptions = {
    minors: ["Math", "Managment", "Psychology"],
    tracks: ["Regular", "Co-op", "Honours"]
};

export default function OptionForm(){
    return (
        <section className="section-container">
  <h2>Program Options</h2>
  <form>
    <label htmlFor="minor-select">Choose a Minor:</label>
    <select id="minor-select">
      <option value="">--select a minor--</option>
      {mockOptions.minors.map((minor) => (
        <option key={minor} value={minor}>{minor}</option>
      ))}
    </select>

    <label htmlFor="track-select">Choose a Program Track:</label>
    <select id="track-select">
      <option value="">--Select a track--</option>
      {mockOptions.tracks.map((track) => (
        <option key={track} value={track}>{track}</option>
      ))}
    </select>

    <button type="button">Save Options</button>
  </form>
</section>

    );
}
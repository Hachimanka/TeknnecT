// src/components/About.jsx

import React, { useState } from 'react';
import './About.css';

// --- Team Member Data ---
const teamMembers = [
  {
    name: 'Alice Johnson',
    role: 'Project Manager',
    img: require('../assets/dj.jpg'),
    description: 'Leads the team and coordinates all project activities.',
  },
  {
    name: 'Bob Smith',
    role: 'Lead Developer',
    img: require('../assets/dj.jpg'),
    description: 'Responsible for backend and frontend development.',
  },
  {
    name: 'Carol Lee',
    role: 'UI/UX Designer',
    img: require('../assets/dj.jpg'),
    description: 'Designs user interfaces and ensures great user experience.',
  },
  {
    name: 'David Kim',
    role: 'QA Engineer',
    img: require('../assets/dj.jpg'),
    description: 'Handles testing and quality assurance.',
  },
  {
    name: 'Eve Martinez',
    role: 'Marketing Lead',
    img: require('../assets/dj.jpg'),
    description: 'Manages marketing and outreach strategies.',
  },
];

function About() {
  const [current, setCurrent] = useState(0);
  const numMembers = teamMembers.length;

  // Arrow navigation functions are no longer needed

  const getPositionClass = (index) => {
    if (index === current) return 'active';
    const prev = (current - 1 + numMembers) % numMembers;
    if (index === prev) return 'left';
    const next = (current + 1) % numMembers;
    if (index === next) return 'right';
    const farPrev = (current - 2 + numMembers) % numMembers;
    if (index === farPrev) return 'far-left';
    const farNext = (current + 2) % numMembers;
    if (index === farNext) return 'far-right';
    return 'hidden';
  };

  return (
    <div className="about-wrapper">
      <h1 className="about-title">OUR TEAM</h1>
      <div className="carousel">
        <div className="carousel-cards">
          {teamMembers.map((member, idx) => (
            <div
              key={member.name}
              className={`carousel-card ${getPositionClass(idx)}`}
              onClick={() => setCurrent(idx)}
              style={{ backgroundImage: `url(${member.img})` }}
            >
              <div className="carousel-card-overlay">
                <span className="carousel-card-name">{member.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="member-details">
        <h2>{teamMembers[current].name}</h2>
        <h4>{teamMembers[current].role}</h4>
        <p>{teamMembers[current].description}</p>
      </div>
    </div>
  );
}

export default About;

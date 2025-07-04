import React, { useState, useEffect } from 'react';
import './About.css';

// --- Team Member Data ---
const teamMembers = [
  {
    name: 'Divan Jude Rosas',
    role: 'Project Manager',
    img: require('../assets/dj.jpg'),
    description: 'Leads the team and coordinates all project activities.',
    contact: 'divanjude.rosas@cit.edu',
  },
  {
    name: 'Leonard Forrosuelo',
    role: 'Lead Developer',
    img: require('../assets/lf.jpg'),
    description: 'Responsible for backend and frontend development.',
    contact: 'leonard.forrosuelo@cit.edu',
  },
  {
    name: 'Adriyanna Diana',
    role: 'UI/UX Designer',
    img: require('../assets/ad.jpg'),
    description: 'Designs user interfaces and ensures great user experience.',
    contact: 'adriyanna.diana@cit.edu',
  },
  {
    name: 'Cliff Edward Alsonado',
    role: 'QA Engineer',
    img: require('../assets/ce.jpg'),
    description: 'Handles testing and quality assurance.',
    contact: 'cliffedward.alsonado@cit.edu',
  },
  {
    name: 'John Michael Inoc',
    role: 'Marketing Lead',
    img: require('../assets/jm.jpg'),
    description: 'Manages marketing and outreach strategies.',
    contact: 'johnmichael.inoc@cit.edu',
  },
];

function About() {
  const [current, setCurrent] = useState(0);
  const numMembers = teamMembers.length;

  // Prevent zooming out
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (e.scale < 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => document.removeEventListener('touchmove', handleTouchMove);
  }, []);

  const getPositionClass = (index) => {
    if (index === current) return 'about-card-active';
    const prev = (current - 1 + numMembers) % numMembers;
    if (index === prev) return 'about-card-left';
    const next = (current + 1) % numMembers;
    if (index === next) return 'about-card-right';
    const farPrev = (current - 2 + numMembers) % numMembers;
    if (index === farPrev) return 'about-card-far-left';
    const farNext = (current + 2) % numMembers;
    if (index === farNext) return 'about-card-far-right';
    return 'about-card-hidden';
  };

  return (
    <div className="about-page-wrapper">
      <h1 className="about-page-title">OUR TEAM</h1>
      <div className="about-carousel">
        <div className="about-carousel-cards">
          {teamMembers.map((member, idx) => (
            <div
              key={member.name}
              className={`about-carousel-card ${getPositionClass(idx)}`}
              onClick={() => setCurrent(idx)}
              style={{ backgroundImage: `url(${member.img})` }}
            >
            </div>
          ))}
        </div>
      </div>
      
      <div className="about-member-details">
        <h2>{teamMembers[current].name}</h2>
        <h4>{teamMembers[current].role}</h4>
        <p>{teamMembers[current].description}</p>
        <p className="about-contact">{teamMembers[current].contact}</p>
      </div>
    </div>
  );
}

export default About;

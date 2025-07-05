import React, { useState, useEffect, useRef } from 'react';

const GuidedTour = ({ isActive, onComplete, steps = [] }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elementPosition, setElementPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tourRef = useRef(null);

  useEffect(() => {
    if (isActive && steps.length > 0) {
      updateElementPosition();
      window.addEventListener('resize', updateElementPosition);
      return () => window.removeEventListener('resize', updateElementPosition);
    }
  }, [isActive, currentStep, steps]);

  const updateElementPosition = () => {
    if (steps[currentStep]?.selector) {
      const element = document.querySelector(steps[currentStep].selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setElementPosition({
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft,
          width: rect.width,
          height: rect.height
        });

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="guided-tour-overlay" ref={tourRef}>
      {/* Blur overlay */}
      <div className="blur-overlay" />
      
      {/* Spotlight circle */}
      <div 
        className="spotlight-circle"
        style={{
          top: elementPosition.top - 10,
          left: elementPosition.left - 10,
          width: elementPosition.width + 20,
          height: elementPosition.height + 20,
        }}
      />
      
      {/* Tooltip */}
      <div 
        className="tour-tooltip"
        style={{
          top: elementPosition.top + elementPosition.height + 20,
          left: elementPosition.left,
        }}
      >
        <div className="tooltip-content">
          <div className="tooltip-header">
            <h3>{currentStepData.title}</h3>
            <button className="skip-button" onClick={handleSkip}>
              Skip Tour
            </button>
          </div>
          
          <p>{currentStepData.description}</p>
          
          <div className="tooltip-footer">
            <div className="step-indicator">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                />
              ))}
            </div>
            
            <div className="tour-controls">
              {currentStep > 0 && (
                <button className="tour-button secondary" onClick={handlePrevious}>
                  Previous
                </button>
              )}
              <button className="tour-button primary" onClick={handleNext}>
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Tooltip arrow */}
        <div className="tooltip-arrow" />
      </div>

      <style jsx>{`
        .guided-tour-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          pointer-events: none;
        }

        .blur-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        .spotlight-circle {
          position: absolute;
          border-radius: 12px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
          background: transparent;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .tour-tooltip {
          position: absolute;
          background: white;
          border-radius: 12px;
          padding: 0;
          min-width: 320px;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          pointer-events: all;
          z-index: 10000;
          transform: translateX(-50%);
        }

        .tooltip-content {
          padding: 20px;
        }

        .tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tooltip-header h3 {
          margin: 0;
          color: #9B000A;
          font-size: 1.2rem;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
        }

        .skip-button {
          background: none;
          border: none;
          color: #666;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .skip-button:hover {
          background-color: #f0f0f0;
        }

        .tooltip-content p {
          margin: 0 0 20px 0;
          color: #333;
          line-height: 1.5;
          font-family: 'Poppins', sans-serif;
        }

        .tooltip-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .step-indicator {
          display: flex;
          gap: 8px;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ddd;
          transition: background-color 0.2s;
        }

        .step-dot.active {
          background-color: #9B000A;
        }

        .step-dot.completed {
          background-color: #ffc107;
        }

        .tour-controls {
          display: flex;
          gap: 8px;
        }

        .tour-button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
        }

        .tour-button.primary {
          background-color: #9B000A;
          color: #ffc107;
        }

        .tour-button.primary:hover {
          background-color: #7a0008;
        }

        .tour-button.secondary {
          background-color: #f0f0f0;
          color: #333;
        }

        .tour-button.secondary:hover {
          background-color: #e0e0e0;
        }

        .tooltip-arrow {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 10px solid white;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .tour-tooltip {
            min-width: 280px;
            max-width: 90vw;
            margin: 0 20px;
          }

          .tooltip-content {
            padding: 16px;
          }

          .tooltip-header h3 {
            font-size: 1.1rem;
          }

          .tour-controls {
            flex-direction: column;
            gap: 8px;
          }

          .tour-button {
            padding: 10px 16px;
            width: 100%;
          }

          .tooltip-footer {
            flex-direction: column;
            gap: 16px;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

// Hook for managing guided tour state
const useGuidedTour = (tourSteps) => {
  const [isActive, setIsActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user has completed tour before (you can store this in localStorage)
    const completed = localStorage.getItem('guidedTourCompleted');
    setHasCompletedTour(completed === 'true');
  }, []);

  const startTour = () => {
    setIsActive(true);
  };

  const completeTour = () => {
    setIsActive(false);
    setHasCompletedTour(true);
    localStorage.setItem('guidedTourCompleted', 'true');
  };

  const resetTour = () => {
    setHasCompletedTour(false);
    localStorage.removeItem('guidedTourCompleted');
  };

  return {
    isActive,
    hasCompletedTour,
    startTour,
    completeTour,
    resetTour
  };
};

// Example usage component
const ExampleHomePage = () => {
  // Define your tour steps
  const tourSteps = [
    {
      selector: '.rent-button',
      title: 'Rent Items',
      description: 'Click here to browse and rent items from other students. Perfect for temporary needs like textbooks or equipment!'
    },
    {
      selector: '.trade-button',
      title: 'Trade Items',
      description: 'Trade your items with other students. Exchange what you don\'t need for something useful!'
    },
    {
      selector: '.lost-found-button',
      title: 'Lost & Found',
      description: 'Report lost items or help return found items to their owners. Build a helpful campus community!'
    },
    {
      selector: '.profile-button',
      title: 'Your Profile',
      description: 'Manage your listings, view your rental history, and update your account settings here.'
    }
  ];

  const { isActive, hasCompletedTour, startTour, completeTour, resetTour } = useGuidedTour(tourSteps);

  return (
    <div className="demo-homepage">
      {/* Navigation */}
      <nav className="demo-nav">
        <div className="nav-brand">TeknnecT</div>
        <div className="nav-buttons">
          <button className="rent-button">Rent</button>
          <button className="trade-button">Trade</button>
          <button className="lost-found-button">Lost & Found</button>
          <button className="profile-button">Profile</button>
        </div>
      </nav>

      {/* Main content */}
      <main className="demo-main">
        <h1>Welcome to TeknnecT!</h1>
        <p>Your campus marketplace for trading, renting, and finding items.</p>
        
        <div className="demo-controls">
          <button className="start-tour-button" onClick={startTour}>
            {hasCompletedTour ? 'Restart Tour' : 'Start Tour'}
          </button>
          {hasCompletedTour && (
            <button className="reset-button" onClick={resetTour}>
              Reset Tour Progress
            </button>
          )}
        </div>
      </main>

      {/* Guided Tour Component */}
      <GuidedTour 
        isActive={isActive}
        onComplete={completeTour}
        steps={tourSteps}
      />

      <style jsx>{`
        .demo-homepage {
          min-height: 100vh;
          background: linear-gradient(135deg, #9B000A 0%, #ffc107 100%);
          font-family: 'Poppins', sans-serif;
        }

        .demo-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .nav-brand {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
        }

        .nav-buttons {
          display: flex;
          gap: 16px;
        }

        .nav-buttons button {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .nav-buttons button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .demo-main {
          text-align: center;
          padding: 100px 20px;
          color: white;
        }

        .demo-main h1 {
          font-size: 3rem;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .demo-main p {
          font-size: 1.2rem;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        .demo-controls {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .start-tour-button,
        .reset-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .start-tour-button {
          background: #ffc107;
          color: #9B000A;
        }

        .start-tour-button:hover {
          background: #ffcd3a;
          transform: translateY(-2px);
        }

        .reset-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .reset-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 768px) {
          .demo-nav {
            flex-direction: column;
            gap: 20px;
            padding: 20px;
          }

          .nav-buttons {
            flex-wrap: wrap;
            justify-content: center;
          }

          .demo-main h1 {
            font-size: 2rem;
          }

          .demo-controls {
            flex-direction: column;
            align-items: center;
          }

          .start-tour-button,
          .reset-button {
            width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default ExampleHomePage;
export { GuidedTour, useGuidedTour };
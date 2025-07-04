import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './PolicyPageModal.css';

function PolicyPageModal({ onAccept, onDecline, viewOnly }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [acceptChecked, setAcceptChecked] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleScroll = (e) => {
    if (viewOnly) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (acceptChecked && hasScrolledToBottom && onAccept) {
      onAccept();
    }
  };

  const handleDecline = () => {
    if (onDecline) onDecline();
  };

  return (
    <div className="PolicyModalOverlay">
      <div className="PolicyModal">
        <div className="PolicyModalHeader">
          <h2>Privacy Policy & Terms of Service</h2>
          <button className="CloseButton" onClick={handleDecline}>
            <FaTimes />
          </button>
        </div>

        <div className="PolicyModalContent" onScroll={handleScroll}>
          <div className="PolicySection">
            <h3>📋 Terms of Service</h3>
            <p>
              Welcome to our Lost & Found platform. By using our service, you agree to the following terms and conditions.
            </p>
            
            <h4>1. Service Description</h4>
            <p>
              Our platform allows users to report lost items and found items to help reconnect people with their belongings. 
              We act as a facilitator and do not guarantee the return of lost items.
            </p>

            <h4>2. User Responsibilities</h4>
            <ul>
              <li>Provide accurate and truthful information about lost or found items</li>
              <li>Respect other users and communicate professionally</li>
              <li>Do not post inappropriate, offensive, or fraudulent content</li>
              <li>Verify the identity of claimants before returning items</li>
              <li>Report any suspicious activity to platform administrators</li>
            </ul>

            <h4>3. Platform Rules</h4>
            <ul>
              <li>Only genuine lost and found items should be posted</li>
              <li>No selling or commercial activities are allowed</li>
              <li>Users must be respectful in all communications</li>
              <li>Spam, scams, or fraudulent posts will result in account suspension</li>
            </ul>

            <h4>4. Liability Disclaimer</h4>
            <p>
              We are not responsible for the loss, damage, or theft of items. Users interact at their own risk. 
              We recommend meeting in public places for item exchanges.
            </p>
          </div>

          <div className="PolicySection">
            <h3>🔒 Privacy Policy</h3>
            
            <h4>Information We Collect</h4>
            <ul>
              <li><strong>Account Information:</strong> Email address, name, and profile details</li>
              <li><strong>Item Posts:</strong> Descriptions, photos, and location information of lost/found items</li>
              <li><strong>Communication:</strong> Messages sent through our platform</li>
              <li><strong>Usage Data:</strong> How you interact with our service</li>
            </ul>

            <h4>How We Use Your Information</h4>
            <ul>
              <li>To provide and improve our lost & found services</li>
              <li>To facilitate communication between users</li>
              <li>To send notifications about potential matches</li>
              <li>To prevent fraud and maintain platform security</li>
              <li>To comply with legal requirements</li>
            </ul>

            <h4>Information Sharing</h4>
            <p>
              We do not sell your personal information. We may share information only:
            </p>
            <ul>
              <li>With other users as part of the lost & found process</li>
              <li>With law enforcement if required by law</li>
              <li>With service providers who help us operate the platform</li>
            </ul>

            <h4>Data Security</h4>
            <p>
              We implement appropriate security measures to protect your information. However, no system is 100% secure, 
              and we cannot guarantee absolute security.
            </p>

            <h4>Your Rights</h4>
            <ul>
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of non-essential communications</li>
              <li>Request data portability</li>
            </ul>

            <h4>Cookies and Tracking</h4>
            <p>
              We use cookies to improve your experience and analyze platform usage. You can manage cookie preferences 
              in your browser settings.
            </p>

            <h4>Contact Information</h4>
            <p>
              If you have questions about this privacy policy, please contact us at:
              <br />
              Email: teknnect@gmail.com
              <br />
              Address: N. Bacalso Avenue, Cebu City ,Philippines 6000
            </p>
          </div>

          <div className="PolicySection LastSection">
            <h3>⚖️ Agreement</h3>
            <p>
              By clicking "Accept," you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service and Privacy Policy. This agreement is effective immediately and remains in effect 
              while you use our service.
            </p>
            <p>
              <strong>Last Updated:</strong> July 2025
            </p>
            
            {/* Checkbox appears at bottom of content */}
            {!viewOnly && hasScrolledToBottom && (
              <div className="AcceptanceSection">
                <label className="CheckboxLabel">
                  <input
                    type="checkbox"
                    checked={acceptChecked}
                    onChange={(e) => setAcceptChecked(e.target.checked)}
                  />
                  <span className="Checkmark"></span>
                  I have read and agree to the Terms of Service and Privacy Policy
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="PolicyModalFooter">
          {/* Only show scroll reminder and Accept/Decline if not viewOnly */}
          {!viewOnly && !hasScrolledToBottom && (
            <div className="ScrollReminder">
              <FaExclamationTriangle />
              <span>Please scroll to the bottom to read all terms</span>
            </div>
          )}

          <div className="ButtonGroup">
            {viewOnly ? (
              <button
                className="AcceptButton"
                onClick={handleDecline}
                style={{ width: '100%' }}
              >
                Close
              </button>
            ) : (
              <>
                <button 
                  className="DeclineButton" 
                  onClick={handleDecline}
                >
                  Decline
                </button>
                <button 
                  className="AcceptButton" 
                  onClick={handleAccept}
                  disabled={!acceptChecked || !hasScrolledToBottom}
                >
                  <FaCheck />
                  Accept & Continue
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PolicyPageModal;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!email.endsWith('@cit.edu')) {
      alert('Only @cit.edu email addresses are allowed.');
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert(`Password reset link sent to: ${email}`);
      })
      .catch((error) => {
        console.error('Error sending reset email:', error);
        alert('Failed to send reset email: ' + error.message);
      });
  };

  // When clicking outside modal
  const handleOverlayClick = () => {
    navigate('/'); // Return to homepage
  };

  // Prevent modal click from triggering overlay
  const handleBoxClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="ModalOverlay" onClick={handleOverlayClick}>
      <div className="LoginBox" onClick={handleBoxClick}>
        <h3>Forgot your password?</h3>
        <h4>Reset Password</h4>
        <form className="LoginForm" onSubmit={handleResetPassword}>
          <div className="PasswordInput">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ paddingRight: '2.5rem' }}
            />
            {/* Invisible span for alignment */}
            <span className="PasswordToggle" style={{ visibility: 'hidden' }}></span>
          </div>

          <button type="submit">Reset Password</button>

          <div className="Links" style={{ justifyContent: 'center', marginTop: '0.8rem' }}>
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

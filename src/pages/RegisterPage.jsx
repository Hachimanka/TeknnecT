import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './RegisterPage.css';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!email.endsWith('@cit.edu')) {
      alert('Only @cit.edu email addresses are allowed to register.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User registered:', user);

        // Send verification email
        sendEmailVerification(user)
          .then(() => {
            alert('Registration successful! A verification email has been sent. Please verify your email before logging in.');
            navigate('/login'); // redirect to login
          })
          .catch((error) => {
            console.error('Error sending verification email:', error);
            alert('Failed to send verification email: ' + error.message);
          });
      })
      .catch((error) => {
        console.error('Error registering:', error);
        alert('Failed to register: ' + error.message);
      });
  };

  return (
    <main className="Main">
      <div className="LoginBox">
        <h3>Welcome!</h3>
        <h4>Register</h4>
        <form className="LoginForm" onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="PasswordInput">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="PasswordToggle" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="PasswordInput">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className="PasswordToggle" onClick={toggleConfirmPasswordVisibility}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">Register</button>

          <div className="Links" style={{ justifyContent: 'center', marginTop: '0.8rem' }}>
            <Link to="/login">Already have an account?</Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default RegisterPage;

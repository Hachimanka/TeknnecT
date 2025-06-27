import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { doc, setDoc } from 'firebase/firestore';
import './RegisterPage.css';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Disable scroll on RegisterPage
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async (e) => {
  e.preventDefault();

  if (!email.endsWith('@cit.edu')) {
    alert('Only @cit.edu email addresses are allowed to register.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User registered:', user);

    // Create Firestore user doc
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      name: user.email.replace('@cit.edu', ''),
      photoURL: '' // empty for now
    });

    // Send verification email
    await sendEmailVerification(user);

    alert('Registration successful! A verification email has been sent. Please verify your email before logging in.');
    navigate('/login');
  } catch (error) {
    console.error('Error registering:', error);
    alert('Failed to register: ' + error.message);
  }
};


  const handleOverlayClick = () => {
    navigate('/'); // ✅ return home if click outside
  };

  const handleBoxClick = (e) => {
    e.stopPropagation(); // ✅ prevent close if click inside modal
  };

  return (
    <div className="ModalOverlay" onClick={handleOverlayClick}>
      <div className="LoginBox" onClick={handleBoxClick}>
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
    </div>
  );
}

export default RegisterPage;

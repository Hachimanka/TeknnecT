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
  const [loading, setLoading] = useState(false);

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
  if (loading) return;
  setLoading(true);

  if (!email.endsWith('@cit.edu')) {
    alert('Only @cit.edu email addresses are allowed to register.');
    setLoading(false);
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    setLoading(false);
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

    // Sign out the user after registration to prevent automatic login
    if (auth.currentUser) {
      await auth.signOut();
    }

    alert('Registration successful! A verification email has been sent. Please verify your email before logging in.');
    navigate('/login');
  } catch (error) {
    console.error('Error registering:', error);
    alert('Failed to register: ' + error.message);
  } finally {
    setLoading(false);
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
            <span className="PasswordToggle" style={{ visibility: 'hidden' }}><FaEye /></span>
          </div>

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

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="Links" style={{ justifyContent: 'center', marginTop: '0.8rem' }}>
            <Link to="/login">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;

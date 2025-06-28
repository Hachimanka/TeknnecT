import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    document.body.style.overflow = 'hidden'; // no scroll
    return () => {
      document.body.style.overflow = 'auto'; // reset scroll when leaving page
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

 

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      setError('❗ Please verify your email before logging in.');
      return; // ⛔ Stop here, don't navigate
    }

    console.log('✅ Login successful:', userCredential.user); // DEBUG LOG
    navigate('/lost-found'); // ✅ Allow login only if email is verified

  } catch (err) {
    console.error('❌ Login failed:', err); // DEBUG LOG
    setError('Invalid email or password');
  }
};



  const handleOverlayClick = () => {
    navigate('/'); // ✅ return to home if click outside
  };

  const handleBoxClick = (e) => {
    e.stopPropagation(); // ✅ prevent click inside box from closing modal
  };

  return (
    <div className="ModalOverlay" onClick={handleOverlayClick}>
      <div className="LoginBox" onClick={handleBoxClick}>
        <h3>Welcome!</h3>
        <h4>Login</h4>

        {error && <p className="Error">{error}</p>}

        <form className="LoginForm" onSubmit={handleLogin}>
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

          <div className="Links">
            <Link to="/forgotpassword">Forgot Password?</Link>
            <Link to="/register">Register</Link>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

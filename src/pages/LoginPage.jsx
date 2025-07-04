import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PolicyPageModal from '../components/PolicyPageModal'; // Import your existing modal
import './LoginPage.css';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [userCredential, setUserCredential] = useState(null);
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
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      if (!userCred.user.emailVerified) {
        setError('❗ Please verify your email before logging in.');
        return; // ⛔ Stop here, don't navigate
      }

      console.log('✅ Login successful:', userCred.user); // DEBUG LOG
      
      // Check if this is first login (you can customize this logic)
      const isFirstLogin = localStorage.getItem(`policy_accepted_${userCred.user.uid}`) === null;
      
      if (isFirstLogin) {
        setUserCredential(userCred);
        setShowPolicyModal(true);
      } else {
        navigate('/lost-found'); // ✅ Navigate directly if policy already accepted
      }

    } catch (err) {
      console.error('❌ Login failed:', err); // DEBUG LOG
      setError('Invalid email or password');
    }
  };

  const handlePolicyAccept = () => {
    // Mark policy as accepted for this user
    localStorage.setItem(`policy_accepted_${userCredential.user.uid}`, 'true');
    setShowPolicyModal(false);
    navigate('/lost-found'); // ✅ Navigate after accepting policy
  };

  const handlePolicyDecline = () => {
    // Log out user if they decline policy
    auth.signOut();
    setShowPolicyModal(false);
    setUserCredential(null);
    setError('You must accept the policy and privacy terms to continue.');
  };

  const handleOverlayClick = () => {
    navigate('/'); // ✅ return to home if click outside
  };

  const handleBoxClick = (e) => {
    e.stopPropagation(); // ✅ prevent click inside box from closing modal
  };

  return (
    <>
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

      {/* Policy Modal */}
      {showPolicyModal && (
        <PolicyPageModal
          onAccept={handlePolicyAccept}
          onDecline={handlePolicyDecline}
        />
      )}
    </>
  );
}

export default LoginPage;
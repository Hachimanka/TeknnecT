import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="Main">
      <div className="LoginBox">
        <h3>Welcome!</h3>
        <h4>Login</h4>
        <form className="LoginForm">
          <input type="email" placeholder="Email" />
          
          <div className="PasswordInput">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
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
    </main>
  );
}

export default LoginPage;

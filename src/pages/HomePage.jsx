import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
   const navigate = useNavigate();
    const handleLoginClick = () => {
    navigate('/login');
  };
  return (


    <div className="HomePage">
      <header className="Header">
        <button className="BrowseButton">Browse Marketplace</button>
        <button className="PostButton">Post an Item</button>
      </header>

      <main className="MainContent">
        <h1 className="MainTitle">Trade, Rent & Find<br></br> Items on Campus</h1>
        <p className="SubTitle">
          The student marketplace that<br></br> makes campus life easier and more<br></br> sustainable.
        </p>

        <div className="ActionButtons">
          <button onClick={handleLoginClick} className="GetStartedButton">Get Started</button>
          <button className="HowItWorksButton">How it works</button>
        </div>
      </main>
    </div>
  );
}

export default HomePage;

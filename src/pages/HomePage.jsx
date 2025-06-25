import { useNavigate } from 'react-router-dom';
import './HomePage.css';


function HomePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="PageWrapper">
      {/* Section 1 with HomePage background */}
      <section className="Section section1">
        <div className="HomePage">
          <header className="Header">
            <button className="BrowseButton">Browse Marketplace</button>
            <button className="PostButton">Post an Item</button>
          </header>

          <main className="MainContent">
            <h1 className="MainTitle">
              Trade, Rent & Find<br /> Items on Campus
            </h1>
            <p className="SubTitle">
              The student marketplace that<br /> makes campus life easier and more<br /> sustainable.
            </p>

            <div className="ActionButtons">
              <button onClick={handleLoginClick} className="GetStartedButton">
                Get Started
              </button>
              <button className="HowItWorksButton">How it works</button>
            </div>
          </main>
        </div>
      </section>

      {/* Section 2 with RedBackground */}
      <section className="Section section2">
        <div className="top-bar">
          <div className="searchBar">
          < input
              type="text"
              placeholder="Search"
              className="borderless-input"/>
          <select id="category" className="dropdown">
            <option value="all">Category</option>
            <option value="news">Trade</option>
            <option value="articles">Lost & Found</option>
            <option value="videos">Donation</option>
            <option value="videos">For Rent</option>
          </select>
          </div>
        </div>
      </section>
          
      {/* Section 3 with YellowBackground */}
      <section className="Section section3">
        <h1 className="pageTitle">Why Use TeknecT</h1>
        <section className="trade-items">
          <div className="card1">
            <h3 className="title"><strong>Save Money</strong></h3>
            <p className="description">Trade or rent items instead of buying new ones. Keep more money in your pocket for what really matters.</p>
          </div>

          <div className="card2">
            <h3 className="title"><strong>Eco-Friendly</strong></h3>
            <p className="description">Reduce waste by reusing and sharing resources. Help create a more sustainable campus community.</p>
          </div>

          <div className="card3">
            <h3 className="title"><strong>Build Community</strong></h3>
            <p className="description">Connect with fellow students,  make new friends, and help each other succeed throughout your academic journey.</p>
          </div>
        </section>
      </section>

      {/* Section 4 with BottomPage2 background */}
      <section className="Section section4">
        <div className="Section4">
          <h1 className="Section4Heading">Get in Touch</h1>
          <div className="ContactRow">
            <p className="Email">Email</p>
            <p className="Phone">Phone</p>
            <p className="Location">Location</p>
          </div>
          <div className="Contacts">
            <p className="Email">johnmichael.inoc@cit.edu</p>
            <p className="Phone">091-7652-5690</p>
            <p className="Location">Duljo, Fatima</p>
          </div>
          <p className="message"> The student marketplace <br/>
                                  that makes campus life<br/>
                                  easier and more<br/>
                                  sustainable</p>
          <div className="BottomText">
            <p classname="quickLinks"> <strong>Quick Links</strong><br/><br/>
                                       Home<br/>
                                       Marketplace<br/>
                                       Lost & Found<br/>
                                       About<br/>
                                       Contact</p>
            <p className="Resources"><bold>Resources</bold><br/>
                                           Help Center<br/>
                                           Community Guidelines<br/>
                                           Privacy Policy</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

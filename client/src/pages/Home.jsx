import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <h1>🥗 Nutrition Assistant</h1>

      <p>
        Track your nutrition, calculate calories, and maintain a healthy
        lifestyle with ease.
      </p>

      <div className="buttons">
        <Link to="/register">
          <button>Get Started</button>
        </Link>

        <Link to="/login">
          <button>Login</button>
        </Link>
      </div>

      <div className="features">
        <div className="card">
          <h3>🥗 Meal Planner</h3>
          <p>Create healthy meal plans.</p>
        </div>

        <div className="card">
          <h3>🔥 Calorie Tracker</h3>
          <p>Track calories every day.</p>
        </div>

        <div className="card">
          <h3>📊 BMI Calculator</h3>
          <p>Monitor your fitness.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
import { useState } from "react";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: formData.age ? Number(formData.age) : undefined,
          weight: formData.weight ? Number(formData.weight) : undefined,
          height: formData.height ? Number(formData.height) : undefined,
        }
      );

      alert(response.data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
        age: "",
        weight: "",
        height: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };


  return (
    <div className="form-container">
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Age (Optional)</label>
          <input
            type="number"
            name="age"
            placeholder="e.g. 25"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Weight (kg) (Optional)</label>
          <input
            type="number"
            name="weight"
            placeholder="e.g. 70"
            value={formData.weight}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Height (cm) (Optional)</label>
          <input
            type="number"
            name="height"
            placeholder="e.g. 175"
            value={formData.height}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Register</button>
      </form>
      <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
        Already have an account? <a href="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>Login here</a>
      </p>
    </div>
  );
}

export default Register;
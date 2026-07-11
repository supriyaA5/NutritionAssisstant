import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    age: currentUser?.age || "",
    weight: currentUser?.weight || "",
    height: currentUser?.height || "",
    gender: currentUser?.gender || "male",
    goal: currentUser?.goal || "Maintain Weight",
    profilePicture: currentUser?.profilePicture || "avatar-1.png",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectAvatar = (presetName) => {
    setFormData({
      ...formData,
      profilePicture: presetName,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          name: formData.name,
          email: formData.email,
          age: formData.age === "" ? "" : Number(formData.age),
          weight: formData.weight === "" ? "" : Number(formData.weight),
          height: formData.height === "" ? "" : Number(formData.height),
          gender: formData.gender,
          goal: formData.goal,
          profilePicture: formData.profilePicture,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("❌ Failed to update profile: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getBMR = () => {
    const { weight, height, age, gender } = formData;
    if (!weight || !height || !age) return "N/A";
    
    let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
    if (gender === "female") {
      bmr -= 161;
    } else {
      bmr += 5;
    }
    return Math.round(bmr) + " kcal";
  };

  const getTDEE = () => {
    const bmrStr = getBMR();
    if (bmrStr === "N/A") return "N/A";
    const bmrNum = parseInt(bmrStr);
    return Math.round(bmrNum * 1.375) + " kcal";
  };

  return (
    <div className="form-container" style={{ maxWidth: "600px" }}>
      <h2>Personal Profile</h2>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        Update your body metrics to calibrate the calorie budget.
      </p>

      {message && (
        <div style={{
          padding: "1rem",
          borderRadius: "var(--radius-sm)",
          textAlign: "center",
          fontWeight: "600",
          marginBottom: "1.5rem",
          background: message.includes("✅") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          color: message.includes("✅") ? "var(--color-success)" : "var(--color-danger)",
          border: `1px solid ${message.includes("✅") ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
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
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label>Age (years)</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 25"
              required
            />
          </div>

          <div className="form-group">
            <label>Height (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g. 175"
              required
            />
          </div>

          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="e.g. 70"
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Goal</label>
            <select name="goal" value={formData.goal} onChange={handleChange}>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Gain Weight">Gain Weight</option>
              <option value="Maintain Weight">Maintain Weight</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Select Profile Character Avatar</label>
          <div className="avatars-preset-grid">
            {[
              { id: "avatar-1.png", emoji: "🦖", name: "Dino" },
              { id: "avatar-2.png", emoji: "🦊", name: "Fox" },
              { id: "avatar-3.png", emoji: "🐼", name: "Panda" },
              { id: "avatar-4.png", emoji: "🐨", name: "Koala" },
              { id: "avatar-5.png", emoji: "🦁", name: "Lion" },
            ].map((avatar) => (
              <div
                key={avatar.id}
                onClick={() => selectAvatar(avatar.id)}
                className={`avatar-preset-option ${formData.profilePicture === avatar.id ? "selected" : ""}`}
              >
                <div>{avatar.emoji}</div>
                <div style={{ fontSize: "0.65rem", marginTop: "0.25rem", color: "var(--text-secondary)" }}>
                  {avatar.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-sm)"
        }}>
          <h4 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>⚡ Estimated Metabolism Calculations</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
            <div>Basal Metabolic Rate (BMR):</div>
            <div style={{ fontWeight: "700", textAlign: "right" }}>{getBMR()}</div>
            <div>Daily Energy Budget (TDEE):</div>
            <div style={{ fontWeight: "700", textAlign: "right" }}>{getTDEE()}</div>
            <div style={{ color: "var(--primary)", fontWeight: "600" }}>Calculated Calorie Target:</div>
            <div style={{ fontWeight: "700", textAlign: "right", color: "var(--primary)" }}>
              {currentUser?.targetCalories || 2000} kcal/day
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
          {loading ? "Updating profile..." : "Save Profile Changes"}
        </button>
      </form>
    </div>
  );
}

export default Profile;

import { useState, useEffect } from "react";
import axios from "axios";

function Report() {
  const [currentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const [meals, setMeals] = useState([]);
  const [waterLog, setWaterLog] = useState({ glasses: 0 });
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch today's meals, water, exercises
        const [mealsRes, waterRes, exercisesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/meals?date=${todayStr}`, { headers }),
          axios.get(`http://localhost:5000/api/water?date=${todayStr}`, { headers }),
          axios.get(`http://localhost:5000/api/exercise?date=${todayStr}`, { headers }),
        ]);

        setMeals(mealsRes.data);
        if (waterRes.data) setWaterLog(waterRes.data);
        setExercises(exercisesRes.data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [todayStr]);

  const handleDownloadPDF = () => {
    window.print();
  };

  // BMI Math
  const numHeight = Number(currentUser?.height || 0);
  const numWeight = Number(currentUser?.weight || 0);
  let bmi = null;
  let bmiCategory = "Unknown";
  if (numHeight > 0 && numWeight > 0) {
    const heightInMeters = numHeight / 100;
    bmi = Number((numWeight / (heightInMeters * heightInMeters)).toFixed(1));
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi >= 18.5 && bmi < 25.0) bmiCategory = "Normal Weight";
    else if (bmi >= 25.0 && bmi < 30.0) bmiCategory = "Overweight";
    else bmiCategory = "Obese";
  }

  // Calories Calculations
  const calorieTarget = currentUser?.targetCalories || 2000;
  const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
  const caloriesBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const caloriesRemaining = calorieTarget - caloriesConsumed + caloriesBurned;

  // Macros totals
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);
  const totalFiber = meals.reduce((sum, m) => sum + (m.fiber || 0), 0);

  // Advice Generator
  const getAdvice = () => {
    if (!bmi) return "Update your weight and height in the Profile page to calculate personalized nutritional advice.";
    switch (bmiCategory) {
      case "Underweight":
        return "Focus on consuming calorie-dense, high-protein foods. Increase your daily protein intake and add healthy fats (avocados, nuts) to gain lean mass safely.";
      case "Normal Weight":
        return "Your weight is in the healthy range! Keep up the excellent work by maintaining a balanced diet rich in whole grains, lean proteins, vegetables, and staying hydrated.";
      case "Overweight":
        return "Aim for a steady caloric deficit of about 300-500 kcal daily. Combine standard aerobic exercises (running, cycling) with a high-protein, high-fiber diet to maintain satiety.";
      case "Obese":
        return "We recommend a controlled calorie diet focused on low-glycemic foods. Restrict refined sugars and include low-impact exercises like yoga or daily walking.";
      default:
        return "Maintain your healthy habits.";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h3>Assembling Health Report...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      {/* Top Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1>📥 Download Health Report</h1>
          <p>Generate a professional nutrition report card as PDF.</p>
        </div>
        <button onClick={handleDownloadPDF} style={{ padding: "0.85rem 1.8rem" }}>
          💾 Download PDF Report
        </button>
      </div>

      {/* Printable Report Box */}
      <div
        id="printable-report"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2.5rem",
          boxShadow: "var(--shadow-md)"
        }}
      >
        {/* Report Header */}
        <div style={{ borderBottom: "2px solid var(--primary)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ color: "var(--primary)", fontSize: "1.8rem", marginBottom: "0.25rem" }}>
                🥗 Nutrition & Health Report
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Generated on: {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h3 style={{ marginBottom: "0.15rem" }}>Nutrition Assistant Inc.</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Official Health Certification</p>
            </div>
          </div>
        </div>

        {/* User profile details grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Patient Name</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{currentUser?.name || "N/A"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Email</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{currentUser?.email || "N/A"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Physique Goal</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)" }}>{currentUser?.goal || "Maintain Weight"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Age & Gender</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{currentUser?.age || "N/A"} yrs / {currentUser?.gender || "male"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Height & Weight</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{currentUser?.height || "N/A"} cm / {currentUser?.weight || "N/A"} kg</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>BMI Score</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{bmi || "N/A"} ({bmiCategory})</div>
          </div>
        </div>

        {/* Nutritional Overview Cards */}
        <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          📊 Today's Nutritional Overview
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={{ padding: "1.25rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "rgba(255, 255, 255, 0.02)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Calorie Budget</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--primary)" }}>{calorieTarget} <span style={{ fontSize: "0.85rem", fontWeight: "normal" }}>kcal</span></div>
          </div>
          <div style={{ padding: "1.25rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "rgba(255, 255, 255, 0.02)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Consumed</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--accent)" }}>{caloriesConsumed} <span style={{ fontSize: "0.85rem", fontWeight: "normal" }}>kcal</span></div>
          </div>
          <div style={{ padding: "1.25rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "rgba(255, 255, 255, 0.02)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Burned Exercises</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--color-warning)" }}>{caloriesBurned} <span style={{ fontSize: "0.85rem", fontWeight: "normal" }}>kcal</span></div>
          </div>
        </div>

        {/* Macros Breakdown */}
        <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          🥗 Macros Breakdown
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ color: "#10b981", fontWeight: "700" }}>Protein</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", marginTop: "0.25rem" }}>{totalProtein}g</div>
          </div>
          <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ color: "#f59e0b", fontWeight: "700" }}>Carbs</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", marginTop: "0.25rem" }}>{totalCarbs}g</div>
          </div>
          <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ color: "#ef4444", fontWeight: "700" }}>Fat</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", marginTop: "0.25rem" }}>{totalFat}g</div>
          </div>
          <div style={{ textAlign: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ color: "#3b82f6", fontWeight: "700" }}>Fiber</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", marginTop: "0.25rem" }}>{totalFiber}g</div>
          </div>
        </div>

        {/* Meals Logged Table */}
        <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          📝 Today's Meal Journal
        </h3>
        <div style={{ marginBottom: "2.5rem" }}>
          {meals.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "1.5rem" }}>
              No meals logged today.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Meal Type</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Food Item</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Calories</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Protein (g)</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Carbs (g)</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Fat (g)</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((m) => (
                  <tr key={m._id} style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.9rem" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: "600", color: "var(--primary)" }}>{m.mealType}</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>{m.foodName}</td>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: "700" }}>{m.calories} kcal</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>{m.protein}g</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>{m.carbs}g</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>{m.fat}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Personalized recommendations */}
        <div style={{
          background: "rgba(139, 92, 246, 0.05)",
          border: "1px solid rgba(139, 92, 246, 0.15)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem"
        }}>
          <h4 style={{ color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
            🧑‍⚕️ Clinical Summary & Recommendation
          </h4>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
            {getAdvice()}
          </p>
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", fontSize: "0.85rem" }}>
            <div><strong>Water Target Met:</strong> {waterLog.glasses} / 8 glasses</div>
            <div><strong>Remaining Budget:</strong> {caloriesRemaining} kcal</div>
          </div>
        </div>

        {/* Signatures */}
        <div style={{ marginTop: "3rem", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "2rem" }}>
          <div>
            <div style={{ fontStyle: "italic", fontSize: "0.95rem" }}>Nutrition Assistant Bot</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Automated Diagnostician</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "700" }}>{currentUser?.name}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Registered Client Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;

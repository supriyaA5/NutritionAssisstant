import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const todayStr = new Date().toISOString().split("T")[0];

  // ================= STATES =================
  const [meals, setMeals] = useState([]);
  const [waterLog, setWaterLog] = useState({ glasses: 0 });
  const [exercises, setExercises] = useState([]);

  // Meal Form
  const [mealForm, setMealForm] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    mealType: "Breakfast",
  });

  // Food Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Exercise Form
  const [exerciseForm, setExerciseForm] = useState({
    name: "Walking",
    duration: "",
  });

  // Goal & BMI
  const [weight, setWeight] = useState(currentUser?.weight || "");
  const [height, setHeight] = useState(currentUser?.height || "");
  const [age, setAge] = useState(currentUser?.age || "");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Loading/Errors
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch today's meals, water log, and exercises
      const [mealsRes, waterRes, exercisesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/meals?date=${todayStr}`, { headers }),
        axios.get(`http://localhost:5000/api/water?date=${todayStr}`, { headers }),
        axios.get(`http://localhost:5000/api/exercise?date=${todayStr}`, { headers }),
      ]);

      setMeals(mealsRes.data);
      if (waterRes.data) {
        setWaterLog(waterRes.data);
      } else {
        setWaterLog({ glasses: 0 });
      }
      setExercises(exercisesRes.data);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // ================= FOOD AUTCOMPLETE SEARCH =================
  useEffect(() => {
    const searchFood = async () => {
      if (searchQuery.trim().length < 1) {
        setSearchResults([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/food?q=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(res.data);
      } catch (error) {
        console.error("Food search error:", error);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchFood();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectFoodItem = (item) => {
    setMealForm({
      ...mealForm,
      foodName: item.name,
      calories: item.calories,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: item.fiber || 0,
    });
    setSearchQuery(item.name);
    setShowDropdown(false);
  };

  // ================= ADD MEAL =================
  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!mealForm.foodName || !mealForm.calories) {
      alert("Please specify food name and calories.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        "http://localhost:5000/api/meals",
        {
          foodName: mealForm.foodName,
          calories: Number(mealForm.calories),
          protein: Number(mealForm.protein) || 0,
          carbs: Number(mealForm.carbs) || 0,
          fat: Number(mealForm.fat) || 0,
          fiber: Number(mealForm.fiber) || 0,
          mealType: mealForm.mealType,
          date: todayStr,
        },
        { headers }
      );

      // Reset form
      setMealForm({
        foodName: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        mealType: "Breakfast",
      });
      setSearchQuery("");
      fetchData();
    } catch (error) {
      console.error("Log meal error:", error);
      alert("Failed to log meal. Please try again.");
    }
  };

  // ================= DELETE MEAL =================
  const handleDeleteMeal = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/meals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Delete meal error:", error);
      alert("Failed to delete item.");
    }
  };

  // ================= WATER LOGGING =================
  const handleUpdateWater = async (glasses) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const newGlasses = Math.max(0, glasses);

      const res = await axios.post(
        "http://localhost:5000/api/water",
        {
          date: todayStr,
          glasses: newGlasses,
        },
        { headers }
      );

      setWaterLog(res.data.water);
    } catch (error) {
      console.error("Water log error:", error);
    }
  };

  // ================= EXERCISE LOGGING =================
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!exerciseForm.duration) return;

    // Calculate burn rates (kcal/min)
    const burnRates = {
      Walking: 5,
      Running: 11,
      Cycling: 8,
      Swimming: 9,
      Yoga: 3.5,
      Gym: 7,
    };

    const rate = burnRates[exerciseForm.name] || 5;
    const caloriesBurned = Math.round(Number(exerciseForm.duration) * rate);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        "http://localhost:5000/api/exercise",
        {
          name: exerciseForm.name,
          duration: Number(exerciseForm.duration),
          caloriesBurned,
          date: todayStr,
        },
        { headers }
      );

      setExerciseForm({ name: "Walking", duration: "" });
      fetchData();
    } catch (error) {
      console.error("Add exercise error:", error);
      alert("Failed to log exercise.");
    }
  };

  // ================= DELETE EXERCISE =================
  const handleDeleteExercise = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/exercise/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Delete exercise error:", error);
    }
  };

  // ================= HEALTH METRIC UPDATES =================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          age: age === "" ? "" : Number(age),
          weight: weight === "" ? "" : Number(weight),
          height: height === "" ? "" : Number(height),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setSaveMessage("✅ Health profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (error) {
      console.error("Save profile error:", error);
      setSaveMessage("❌ Failed to update statistics.");
    } finally {
      setSaveLoading(false);
    }
  };

  // ================= METRICS math =================
  const totalCalories = meals.reduce((sum, item) => sum + Number(item.calories), 0);
  const caloriesBurned = exercises.reduce((sum, item) => sum + Number(item.caloriesBurned), 0);
  const calorieTarget = currentUser?.targetCalories || 2000;
  const caloriesRemaining = calorieTarget - totalCalories + caloriesBurned;
  const caloriePercent = Math.min((totalCalories / calorieTarget) * 100, 100);

  // BMI score
  const numHeight = Number(currentUser?.height || 0);
  const numWeight = Number(currentUser?.weight || 0);
  let bmi = null;
  let bmiCategory = "";
  let bmiBadgeClass = "";
  let bmiMarkerPosition = 0;

  if (numHeight > 0 && numWeight > 0) {
    const heightInMeters = numHeight / 100;
    bmi = Number((numWeight / (heightInMeters * heightInMeters)).toFixed(1));

    if (bmi < 18.5) {
      bmiCategory = "Underweight";
      bmiBadgeClass = "badge-underweight";
      bmiMarkerPosition = Math.max(5, (bmi / 18.5) * 25);
    } else if (bmi >= 18.5 && bmi < 25.0) {
      bmiCategory = "Normal Weight";
      bmiBadgeClass = "badge-normal";
      bmiMarkerPosition = 25 + ((bmi - 18.5) / (25.0 - 18.5)) * 25;
    } else if (bmi >= 25.0 && bmi < 30.0) {
      bmiCategory = "Overweight";
      bmiBadgeClass = "badge-overweight";
      bmiMarkerPosition = 50 + ((bmi - 25.0) / (30.0 - 25.0)) * 25;
    } else {
      bmiCategory = "Obese";
      bmiBadgeClass = "badge-obese";
      bmiMarkerPosition = Math.min(95, 75 + ((bmi - 30.0) / 15.0) * 20);
    }
  }

  // Nutrition Totals (macros)
  const totalProtein = meals.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalFat = meals.reduce((sum, item) => sum + (item.fat || 0), 0);
  const totalFiber = meals.reduce((sum, item) => sum + (item.fiber || 0), 0);

  // Doughnut macros chart
  const hasMacros = totalProtein > 0 || totalCarbs > 0 || totalFat > 0;
  const macroChartData = {
    labels: ["Protein (g)", "Carbohydrates (g)", "Fat (g)"],
    datasets: [
      {
        data: hasMacros ? [totalProtein, totalCarbs, totalFat] : [1, 1, 1], // pre-populate placeholder
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: "var(--bg-card)",
        borderWidth: 2,
        cutout: "70%",
      },
    ],
  };

  const macroChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasMacros,
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}g`,
        },
      },
    },
  };

  // Water calculations
  const waterTarget = 8; // target 8 glasses
  const waterPercent = Math.min((waterLog.glasses / waterTarget) * 100, 100);
  const waterCircumference = 2 * Math.PI * 65; // radius = 65
  const waterStrokeDashoffset = waterCircumference - (waterPercent / 100) * waterCircumference;

  // Dynamic recommendations
  const getNutritionRecommendation = () => {
    if (!bmi) {
      return {
        title: "Calibrate Metrics...",
        body: "Update your height and weight to receive dynamic nutritional advice based on your body composition.",
        breakfast: { name: "Oatmeal with Almonds", c: 280, p: 10, cbs: 38, f: 6 },
        lunch: { name: "Grilled Chicken Salad", c: 450, p: 35, cbs: 12, f: 15 },
        dinner: { name: "Salmon with Rice", c: 550, p: 30, cbs: 45, f: 18 },
        snacks: { name: "Greek Yogurt & Berries", c: 150, p: 12, cbs: 15, f: 1 },
      };
    }

    if (bmiCategory === "Underweight") {
      return {
        title: "High Protein & Calorie Intake Focus",
        body: "Your BMI classification is Underweight. Aim to hit a calorie surplus by choosing nutrient-dense, high protein meals.",
        breakfast: { name: "Banana Peanut Butter Shake", c: 480, p: 20, cbs: 55, f: 18 },
        lunch: { name: "Steak and Sweet Potatoes", c: 680, p: 45, cbs: 65, f: 22 },
        dinner: { name: "Salmon Rice Bowl with Avocado", c: 750, p: 38, cbs: 70, f: 28 },
        snacks: { name: "Mixed Nuts & Protein Bar", c: 320, p: 15, cbs: 25, f: 14 },
      };
    } else if (bmiCategory === "Normal Weight") {
      return {
        title: "Balanced Healthy Diet Plan",
        body: "Your BMI classification is Normal. Maintain your metabolic health by matching active energy output and getting whole proteins.",
        breakfast: { name: "Scrambled Eggs & Whole Wheat Toast", c: 320, p: 18, cbs: 22, f: 12 },
        lunch: { name: "Chicken Quinoa Bowl", c: 510, p: 35, cbs: 45, f: 14 },
        dinner: { name: "Baked Turkey & Steamed Broccoli", c: 420, p: 30, cbs: 30, f: 8 },
        snacks: { name: "Apple Slices & Greek Yogurt", c: 180, p: 10, cbs: 20, f: 2 },
      };
    } else if (bmiCategory === "Overweight") {
      return {
        title: "Lean Calorie Deficit Plan",
        body: "Your BMI classification is Overweight. Track portions and create a safe calorie deficit. Emphasize fibers and lean cuts.",
        breakfast: { name: "Egg Whites & Avocado Toast", c: 260, p: 15, cbs: 20, f: 8 },
        lunch: { name: "Tuna Salad (light mayo)", c: 380, p: 32, cbs: 10, f: 10 },
        dinner: { name: "Grilled Tofu with Asparagus & Cauliflower Rice", c: 310, p: 22, cbs: 18, f: 9 },
        snacks: { name: "Celery Sticks & Peanut Butter", c: 120, p: 4, cbs: 8, f: 8 },
      };
    } else {
      return {
        title: "Sugar & Portion Control Focus",
        body: "Your BMI is classified as Obese. Avoid glycemic-spiking carbohydrates. Consume fibrous greens, lean turkey, and egg whites.",
        breakfast: { name: "Chia Seed Pudding & Berries", c: 210, p: 8, cbs: 18, f: 6 },
        lunch: { name: "Baked Tilapia & Mixed Salad", c: 290, p: 28, cbs: 8, f: 7 },
        dinner: { name: "Grilled Turkey Breast & Zucchini Noodles", c: 320, p: 35, cbs: 12, f: 6 },
        snacks: { name: "Hard Boiled Egg", c: 78, p: 6, cbs: 0, f: 5 },
      };
    }
  };

  const advice = getNutritionRecommendation();

  // ================= NOTIFICATIONS LOGIC =================
  const getReminders = () => {
    const list = [];
    if (waterLog.glasses < 5) {
      list.push({ type: "water", title: "💧 Drink Water Alert", text: "You logged less than 5 glasses of water today. Keep hydrated!" });
    }
    const typesLogged = meals.map((m) => m.mealType);
    if (!typesLogged.includes("Breakfast")) {
      list.push({ type: "breakfast", title: "🍳 Complete Breakfast Reminder", text: "Breakfast fuels your morning focus. Log it today!" });
    }
    if (totalCalories > 0 && !typesLogged.includes("Lunch") && new Date().getHours() >= 14) {
      list.push({ type: "lunch", title: "🥗 Lunch Reminder", text: "Remember to log your lunch to keep calorie tracking accurate." });
    }
    if (exercises.length === 0) {
      list.push({ type: "exercise", title: "🏃 Exercise Reminder", text: "Log a workout (e.g. Walking or Gym) to burn active calories!" });
    }
    return list;
  };

  const reminders = getReminders();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h3>Loading your Dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Notifications Row */}
      {reminders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", gridColumn: "1 / -1" }}>
          {reminders.slice(0, 2).map((rem, idx) => (
            <div key={idx} className={`notification-banner ${rem.type === "water" ? "water-reminder" : ""}`}>
              <span className="notification-emoji">
                {rem.type === "water" ? "🐳" : rem.type === "exercise" ? "👟" : "🔔"}
              </span>
              <div className="notification-content">
                <h4>{rem.title}</h4>
                <p>{rem.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Header */}
      <div className="dashboard-grid">
        <div className="dashboard-header">
          <div>
            <h1>🥗 Fit Dashboard</h1>
            <p>Welcome back, {currentUser?.name || "User"}!</p>
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            📆 Date: {todayStr}
          </div>
        </div>

        {/* 1. STATS ROW (3 Cards) */}
        <div className="stats-cards-container">
          <div className="stat-item-card">
            <div className="stat-icon-wrapper">🔥</div>
            <div className="stat-details">
              <h4>Consumed</h4>
              <span className="stat-value">{totalCalories} kcal</span>
              <span className="stat-subtext">Budget: {calorieTarget} kcal</span>
            </div>
          </div>

          <div className="stat-item-card">
            <div className="stat-icon-wrapper accent">⚖️</div>
            <div className="stat-details">
              <h4>Remaining</h4>
              <span className="stat-value" style={{ color: caloriesRemaining < 0 ? "var(--color-danger)" : "var(--primary)" }}>
                {caloriesRemaining} kcal
              </span>
              <span className="stat-subtext">Burned: +{caloriesBurned} kcal</span>
            </div>
          </div>

          <div className="stat-item-card">
            <div className="stat-icon-wrapper warning">📊</div>
            <div className="stat-details">
              <h4>BMI Score</h4>
              <span className="stat-value">{bmi || "N/A"}</span>
              <span className="stat-subtext">{bmiCategory || "Stats unset"}</span>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: MEAL LOGGING & AUTCOMPLETE */}
        <div className="dashboard-panel" style={{ gridColumn: "span 2" }}>
          <h2>🥩 Log Meals & Food Items</h2>

          {/* Autocomplete Search input */}
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label>Search Food Database</label>
            <div className="autocomplete-wrapper">
              <input
                type="text"
                placeholder="Type 'Apple' or 'Chicken'..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="autocomplete-dropdown">
                  {searchResults.map((item) => (
                    <div
                      key={item._id}
                      className="autocomplete-item"
                      onClick={() => handleSelectFoodItem(item)}
                    >
                      <strong>{item.name}</strong> - {item.calories} kcal (P: {item.protein}g, C: {item.carbs}g, F: {item.fat}g)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meal Add Form */}
          <form onSubmit={handleAddMeal}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label>Food Item</label>
                <input
                  type="text"
                  placeholder="e.g. Oats"
                  value={mealForm.foodName}
                  onChange={(e) => setMealForm({ ...mealForm, foodName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Calories (kcal)</label>
                <input
                  type="number"
                  placeholder="Calories"
                  value={mealForm.calories}
                  onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Meal Time</label>
                <select
                  value={mealForm.mealType}
                  onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
            </div>

            {/* Macros Form Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.7rem" }}>Protein (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={mealForm.protein}
                  onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: "0.7rem" }}>Carbs (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={mealForm.carbs}
                  onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: "0.7rem" }}>Fat (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={mealForm.fat}
                  onChange={(e) => setMealForm({ ...mealForm, fat: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: "0.7rem" }}>Fiber (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={mealForm.fiber}
                  onChange={(e) => setMealForm({ ...mealForm, fiber: e.target.value })}
                />
              </div>
            </div>

            <button type="submit">✍️ Log Food Meal</button>
          </form>

          {/* Meals Log List */}
          <div style={{ marginTop: "2rem" }}>
            <h3>Log History (Today)</h3>
            <div style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "rgba(0,0,0,0.15)", overflow: "hidden" }}>
              {meals.length === 0 ? (
                <p style={{ textAlign: "center", fontStyle: "italic", padding: "1.5rem", color: "var(--text-muted)" }}>
                  No foods logged today. Log meals above.
                </p>
              ) : (
                meals.map((item) => (
                  <div key={item._id} className="log-item-row">
                    <div className="log-item-info">
                      <span className="log-item-title">{item.foodName}</span>
                      <span className="log-item-sub">
                        P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g | Fib: {item.fiber}g
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span className="log-item-badge">{item.mealType}</span>
                      <strong style={{ fontSize: "0.95rem" }}>{item.calories} kcal</strong>
                      <button
                        onClick={() => handleDeleteMeal(item._id)}
                        className="danger"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CIRCULAR WATER TRACKER */}
        <div className="dashboard-panel">
          <h2>💧 Water Intake</h2>
          <div className="water-tracker-container">
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg className="circular-progress-svg">
                <circle className="circle-bg" cx="80" cy="80" r="65" />
                <circle
                  className="circle-progress"
                  cx="80"
                  cy="80"
                  r="65"
                  strokeDasharray={waterCircumference}
                  strokeDashoffset={waterStrokeDashoffset}
                />
              </svg>
              <div className="water-center-text">
                <span className="water-glasses-count">{waterLog.glasses}</span>
                <span className="water-glasses-lbl">Glasses</span>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Daily target: 8 glasses (2 Liters)
            </p>

            <div className="water-controls">
              <button
                onClick={() => handleUpdateWater(waterLog.glasses - 1)}
                className="water-btn-circle"
              >
                -
              </button>
              <button
                onClick={() => handleUpdateWater(waterLog.glasses + 1)}
                className="water-btn-circle"
                style={{ background: "var(--color-info)", borderColor: "var(--color-info)", color: "white" }}
              >
                +
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", fontStyle: "italic", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              {waterLog.glasses >= 8 ? "🎉 Water target met!" : `${8 - waterLog.glasses} glasses remaining.`}
            </p>
          </div>
        </div>

        {/* BOTTOM ROW (LEFT): MACROS RATIO AND PROGRESS BARS */}
        <div className="dashboard-panel">
          <h2>🥗 Daily Nutrition Ratio</h2>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem" }}>
            <div style={{ width: "120px", height: "120px", position: "relative" }}>
              <Doughnut data={macroChartData} options={macroChartOptions} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Intake</span>
                <strong style={{ fontSize: "1.1rem" }}>{totalCalories}</strong>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="macro-progress-list">
                <div className="macro-bar-container">
                  <div className="macro-label-row">
                    <span>Protein</span>
                    <span style={{ color: "#10b981" }}>{totalProtein}g</span>
                  </div>
                  <div className="macro-track">
                    <div className="macro-fill protein" style={{ width: `${Math.min((totalProtein / 120) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="macro-bar-container">
                  <div className="macro-label-row">
                    <span>Carbs</span>
                    <span style={{ color: "#f59e0b" }}>{totalCarbs}g</span>
                  </div>
                  <div className="macro-track">
                    <div className="macro-fill carbs" style={{ width: `${Math.min((totalCarbs / 250) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="macro-bar-container">
                  <div className="macro-label-row">
                    <span>Fats</span>
                    <span style={{ color: "#ef4444" }}>{totalFat}g</span>
                  </div>
                  <div className="macro-track">
                    <div className="macro-fill fat" style={{ width: `${Math.min((totalFat / 80) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="macro-bar-container">
                  <div className="macro-label-row">
                    <span>Fiber</span>
                    <span style={{ color: "#3b82f6" }}>{totalFiber}g</span>
                  </div>
                  <div className="macro-track">
                    <div className="macro-fill fiber" style={{ width: `${Math.min((totalFiber / 30) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (CENTER): EXERCISE LOGGER */}
        <div className="dashboard-panel">
          <h2>👟 Exercise & Workouts</h2>

          <form onSubmit={handleAddExercise} style={{ gap: "0.75rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0.5rem" }}>
              <div className="form-group">
                <label>Workout Type</label>
                <select
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                >
                  <option value="Walking">Walking</option>
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Gym">Gym</option>
                </select>
              </div>

              <div className="form-group">
                <label>Minutes</label>
                <input
                  type="number"
                  placeholder="Minutes"
                  value={exerciseForm.duration}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, duration: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)" }}>
              🔥 Log Active Workout
            </button>
          </form>

          {/* Exercises list */}
          <div style={{ marginTop: "1rem", maxHeight: "150px", overflowY: "auto" }}>
            {exercises.length === 0 ? (
              <p style={{ textAlign: "center", fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-muted)", padding: "1rem" }}>
                No active workouts logged today.
              </p>
            ) : (
              exercises.map((e) => (
                <div key={e._id} className="log-item-row" style={{ padding: "0.5rem 0.75rem" }}>
                  <div className="log-item-info">
                    <span className="log-item-title">{e.name}</span>
                    <span className="log-item-sub">{e.duration} mins logged</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="log-item-badge exercise">-{e.caloriesBurned} kcal</span>
                    <button
                      onClick={() => handleDeleteExercise(e._id)}
                      className="danger"
                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM ROW (RIGHT): SMART RECOMMENDATIONS */}
        <div className="dashboard-panel">
          <h2>🥗 Smart Recommendation</h2>
          
          <div className="recommendation-panel" style={{ marginTop: "0.5rem" }}>
            <div className="recommendation-title">
              <span>🩺</span> {advice.title}
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              {advice.body}
            </p>
            
            <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
              Recommended Meal Options:
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.25rem", fontSize: "0.78rem" }}>
              <div>🍳 <strong>Breakfast:</strong> {advice.breakfast.name} ({advice.breakfast.c} kcal)</div>
              <div>🥗 <strong>Lunch:</strong> {advice.lunch.name} ({advice.lunch.c} kcal)</div>
              <div>🐟 <strong>Dinner:</strong> {advice.dinner.name} ({advice.dinner.c} kcal)</div>
              <div>🍎 <strong>Snack:</strong> {advice.snacks.name} ({advice.snacks.c} kcal)</div>
            </div>
          </div>
        </div>

        {/* BMI HISTORY GAUGE METRIC */}
        <div className="dashboard-panel" style={{ gridColumn: "1 / -1" }}>
          <h2>📈 BMI Body Composition Gauge</h2>
          {bmi ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700" }}>Body Mass Index: {bmi}</span>
                  <span className={`badge ${bmiBadgeClass}`}>{bmiCategory}</span>
                </div>

                <div className="bmi-bar-container">
                  <div className="bmi-bar-segment under" title="Underweight (<18.5)"></div>
                  <div className="bmi-bar-segment normal" title="Normal (18.5 - 25)"></div>
                  <div className="bmi-bar-segment over" title="Overweight (25 - 30)"></div>
                  <div className="bmi-bar-segment obese" title="Obese (>=30)"></div>
                </div>
                <div className="bmi-marker-wrapper">
                  <div className="bmi-marker" style={{ left: `${bmiMarkerPosition}%` }}></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <span>Underweight (&lt;18.5)</span>
                  <span>Normal (18.5-24.9)</span>
                  <span>Overweight (25-29.9)</span>
                  <span>Obese (&gt;=30)</span>
                </div>
              </div>

              {/* BMI updates log form */}
              <form onSubmit={handleSaveProfile} style={{ gap: "0.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.7rem" }}>Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.7rem" }}>Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.7rem" }}>Age (yrs)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={saveLoading} style={{ padding: "0.5rem", fontSize: "0.85rem" }}>
                  {saveLoading ? "Saving..." : "Update Body Stats"}
                </button>
                {saveMessage && (
                  <div style={{ fontSize: "0.8rem", textAlign: "center", color: "var(--primary)" }}>
                    {saveMessage}
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div style={{ fontStyle: "italic", textAlign: "center", color: "var(--text-muted)" }}>
              BMI metrics could not be calculated. Please calibrate weight/height in the Profile page or the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
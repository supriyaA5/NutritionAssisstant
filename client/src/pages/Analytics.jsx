import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Analytics() {
  const [range, setRange] = useState(7); // default 7 days
  const [meals, setMeals] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [bmiHistory, setBmiHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all meals, water history, and BMI logs
      const [mealsRes, waterRes, bmiRes] = await Promise.all([
        axios.get("http://localhost:5000/api/meals", { headers }),
        axios.get("http://localhost:5000/api/water/history", { headers }),
        axios.get("http://localhost:5000/api/bmi/history", { headers })
      ]);

      setMeals(mealsRes.data);
      setWaterLogs(waterRes.data);
      setBmiHistory(bmiRes.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Generate date list for range
  const getDatesRange = (numDays) => {
    const arr = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split("T")[0]);
    }
    return arr;
  };

  const datesList = getDatesRange(range);

  // Format date readable e.g., "Jul 11"
  const formatLabelDate = (dateStr) => {
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartLabels = datesList.map(formatLabelDate);

  // 1. Calories per Day
  const caloriesDataMap = datesList.map((date) => {
    const dayMeals = meals.filter((m) => m.date === date);
    return dayMeals.reduce((sum, m) => sum + m.calories, 0);
  });

  // 2. Water intake per Day
  const waterDataMap = datesList.map((date) => {
    const log = waterLogs.find((w) => w.date === date);
    return log ? log.glasses : 0;
  });

  // 3. BMI & Weight history map (carry over last value if date has no update)
  let lastKnownWeight = 0;
  let lastKnownBmi = 0;

  // Prepopulate last known if history extends before our range
  const sortedBmi = [...bmiHistory].sort((a, b) => a.date.localeCompare(b.date));
  
  const weightDataMap = datesList.map((date) => {
    const entry = sortedBmi.find((b) => b.date === date);
    if (entry) {
      lastKnownWeight = entry.weight;
      lastKnownBmi = entry.bmi;
    }
    // If we haven't seen any entry yet, check if there's any record in the past
    if (lastKnownWeight === 0) {
      const pastEntry = sortedBmi.filter((b) => b.date < date).pop();
      if (pastEntry) {
        lastKnownWeight = pastEntry.weight;
        lastKnownBmi = pastEntry.bmi;
      }
    }
    return lastKnownWeight;
  });

  lastKnownWeight = 0;
  lastKnownBmi = 0;
  
  const bmiDataMap = datesList.map((date) => {
    const entry = sortedBmi.find((b) => b.date === date);
    if (entry) {
      lastKnownBmi = entry.bmi;
    }
    if (lastKnownBmi === 0) {
      const pastEntry = sortedBmi.filter((b) => b.date < date).pop();
      if (pastEntry) {
        lastKnownBmi = pastEntry.bmi;
      }
    }
    return lastKnownBmi;
  });

  // Theme support: detect background colors for charts
  const isLight = document.documentElement.classList.contains("light-theme");
  const gridColor = isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.05)";
  const textColor = isLight ? "#475569" : "#94a3b8";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: textColor, font: { family: "Plus Jakarta Sans", weight: "600" } }
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "Plus Jakarta Sans" } } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "Plus Jakarta Sans" } } }
    }
  };

  const caloriesChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Calorie Intake (kcal)",
        data: caloriesDataMap,
        backgroundColor: "rgba(16, 185, 129, 0.25)",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  const waterChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Water Consumed (glasses)",
        data: waterDataMap,
        backgroundColor: "rgba(59, 130, 246, 0.25)",
        borderColor: "#3b82f6",
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  const bmiChartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: "BMI Score",
        data: bmiDataMap,
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 3,
        tension: 0.35,
        pointBackgroundColor: "#8b5cf6",
      }
    ]
  };

  const weightChartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: "Weight History (kg)",
        data: weightDataMap,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 3,
        tension: 0.35,
        pointBackgroundColor: "#f59e0b",
      }
    ]
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h3>Loading Analytics charts...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1>📊 Weekly & Monthly Analytics</h1>
          <p>Review calories, water intake, weight, and BMI trends.</p>
        </div>

        <div className="analytics-filter-bar">
          <button
            onClick={() => setRange(7)}
            className={range === 7 ? "" : "secondary"}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange(30)}
            className={range === 30 ? "" : "secondary"}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Calories Bar Chart */}
        <div className="dashboard-panel" style={{ gridColumn: "span 2", minHeight: "320px" }}>
          <h3>🔥 Calorie Intake Overview</h3>
          <div style={{ height: "240px", position: "relative" }}>
            <Bar data={caloriesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Water Bar Chart */}
        <div className="dashboard-panel" style={{ minHeight: "320px" }}>
          <h3>💧 Water Tracker Trend</h3>
          <div style={{ height: "240px", position: "relative" }}>
            <Bar data={waterChartData} options={chartOptions} />
          </div>
        </div>

        {/* BMI Line Chart */}
        <div className="dashboard-panel" style={{ minHeight: "320px" }}>
          <h3>📈 BMI History</h3>
          <div style={{ height: "240px", position: "relative" }}>
            <Line data={bmiChartData} options={chartOptions} />
          </div>
        </div>

        {/* Weight Line Chart */}
        <div className="dashboard-panel" style={{ gridColumn: "span 2", minHeight: "320px" }}>
          <h3>⚖️ Weight Log Timeline</h3>
          <div style={{ height: "240px", position: "relative" }}>
            <Line data={weightChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;

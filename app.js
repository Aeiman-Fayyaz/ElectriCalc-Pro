// Theme Management
class ThemeManager {
  constructor() {
    this.isDark = this.getStoredTheme();
    this.init();
  }

  getStoredTheme() {
    const stored = localStorage.getItem("electricalc-theme");
    return stored ? JSON.parse(stored) : false;
  }

  init() {
    this.applyTheme();
    this.setupToggle();
  }

  applyTheme() {
    const body = document.body;
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    if (this.isDark) {
      body.setAttribute("data-theme", "dark");
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      body.removeAttribute("data-theme");
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }

    localStorage.setItem("electricalc-theme", JSON.stringify(this.isDark));
  }

  setupToggle() {
    const toggle = document.getElementById("theme-toggle");
    toggle.addEventListener("click", () => {
      this.isDark = !this.isDark;
      this.applyTheme();
    });
  }
}

// Calculation History Manager
class HistoryManager {
  constructor() {
    this.calculations = this.getStoredCalculations();
    this.render();
  }

  getStoredCalculations() {
    const stored = localStorage.getItem("electricalc-history");
    return stored ? JSON.parse(stored) : [];
  }

  addCalculation(calculation) {
    const newCalc = {
      ...calculation,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    this.calculations.push(newCalc);
    this.saveCalculations();
    this.render();
  }

  clearHistory() {
    this.calculations = [];
    this.saveCalculations();
    this.render();
  }

  saveCalculations() {
    localStorage.setItem(
      "electricalc-history",
      JSON.stringify(this.calculations)
    );
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatInputName(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  render() {
    const container = document.getElementById("history-content");

    if (this.calculations.length === 0) {
      container.innerHTML = `
                <div class="empty-history">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    <p class="empty-text">No calculations yet. Start calculating to see your history here.</p>
                </div>
            `;
      return;
    }

    const historyHTML = this.calculations
      .slice()
      .reverse()
      .map(
        (calc) => `
                <div class="history-item">
                    <div class="history-item-header">
                        <h4 class="history-item-title">${calc.type}</h4>
                        <span class="history-item-time">${this.formatTimestamp(
                          calc.timestamp
                        )}</span>
                    </div>
                    
                    <div class="history-item-inputs">
                        ${Object.entries(calc.inputs)
                          .map(
                            ([key, value]) => `
                            <div class="history-input">
                                <span>${this.formatInputName(key)}: </span>
                                <span class="history-input-value">${value}</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                    
                    <div class="history-item-result">
                        <span class="history-result-value">
                            Result: ${calc.result.toFixed(2)} ${calc.unit}
                        </span>
                    </div>
                </div>
            `
      )
      .join("");

    container.innerHTML = historyHTML;
  }
}

// Utility Functions
function showResult(containerId, value, unit, description) {
  const container = document.getElementById(containerId);
  const valueElement = container.querySelector(".result-value");
  const descElement = container.querySelector(".result-description");

  valueElement.textContent = `${value.toFixed(2)} ${unit}`;
  descElement.textContent = description;

  container.classList.remove("hidden");
  container.classList.add("fade-in");
}

function hideResult(containerId) {
  const container = document.getElementById(containerId);
  container.classList.add("hidden");
  container.classList.remove("fade-in");
}

function validateInputs(...values) {
  return values.every((val) => !isNaN(val) && val > 0);
}

function showAlert(message) {
  alert(message);
}

// Calculator Functions

// AC to DC Converter
function calculateACToDC() {
  const acVoltage = parseFloat(document.getElementById("ac-voltage").value);
  const efficiency = parseFloat(document.getElementById("ac-efficiency").value);

  if (!validateInputs(acVoltage, efficiency) || efficiency > 100) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter valid positive numbers | Check all fields must be fill",
    });
    return;
  }

  const efficiencyDecimal = efficiency / 100;
  const dcVoltage = acVoltage * Math.sqrt(2) * efficiencyDecimal;

  showResult(
    "ac-result",
    dcVoltage,
    "V DC",
    `Converted from ${acVoltage}V AC at ${efficiency}% efficiency`
  );

  historyManager.addCalculation({
    type: "AC to DC Conversion",
    inputs: { acVoltage, efficiency },
    result: dcVoltage,
    unit: "V DC",
  });
}

function resetACToDC() {
  document.getElementById("ac-voltage").value = "";
  document.getElementById("ac-efficiency").value = "85";
  hideResult("ac-result");
}

// Watt to Volt Converter
function calculateWattToVolt() {
  const watts = parseFloat(document.getElementById("wv-watts").value);
  const amperes = parseFloat(document.getElementById("wv-amperes").value);

  if (!validateInputs(watts, amperes)) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter valid positive numbers | Check all fields must be fill",
    });
    return;
  }

  const voltage = watts / amperes;

  showResult("wv-result", voltage, "V", `Voltage for ${watts}W at ${amperes}A`);

  historyManager.addCalculation({
    type: "Watt to Volt Conversion",
    inputs: { watts, amperes },
    result: voltage,
    unit: "V",
  });
}

function resetWattToVolt() {
  document.getElementById("wv-watts").value = "";
  document.getElementById("wv-amperes").value = "";
  hideResult("wv-result");
}

// Watt to Ampere Converter
function calculateWattToAmpere() {
  const watts = parseFloat(document.getElementById("wa-watts").value);
  const volts = parseFloat(document.getElementById("wa-volts").value);

  if (!validateInputs(watts, volts)) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter valid positive numbers | Check all fields must be fill",
    });
    return;
  }

  const amperage = watts / volts;

  showResult("wa-result", amperage, "A", `Current for ${watts}W at ${volts}V`);

  historyManager.addCalculation({
    type: "Watt to Ampere Conversion",
    inputs: { watts, volts },
    result: amperage,
    unit: "A",
  });
}

function resetWattToAmpere() {
  document.getElementById("wa-watts").value = "";
  document.getElementById("wa-volts").value = "";
  hideResult("wa-result");
}

// Volt to Ampere Converter
function calculateVoltToAmpere() {
  const volts = parseFloat(document.getElementById("va-volts").value);
  const resistance = parseFloat(document.getElementById("va-resistance").value);

  if (!validateInputs(volts, resistance)) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter valid positive numbers | Check all fields must be fill",
    });
    return;
  }

  const amperage = volts / resistance;

  showResult(
    "va-result",
    amperage,
    "A",
    `Current for ${volts}V through ${resistance}Ω resistance`
  );

  historyManager.addCalculation({
    type: "Volt to Ampere Conversion",
    inputs: { volts, resistance },
    result: amperage,
    unit: "A",
  });
}

function resetVoltToAmpere() {
  document.getElementById("va-volts").value = "";
  document.getElementById("va-resistance").value = "";
  hideResult("va-result");
}

// Clear History
function clearHistory() {
  if (Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: "Deleted!",
      text: "Your file has been deleted.",
      icon: "success"
    });
  }
})) {
    historyManager.clearHistory();
  }
}

// Initialize Application
let themeManager;
let historyManager;

document.addEventListener("DOMContentLoaded", function () {
  themeManager = new ThemeManager();
  historyManager = new HistoryManager();

  // Add keyboard support for Enter key on inputs
  const inputs = document.querySelectorAll(".input-field");
  inputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const card = input.closest(".calculator-card");
        const calculateBtn = card.querySelector(".btn-primary");
        calculateBtn.click();
      }
    });
  });

  // Add smooth scrolling for better UX
  document.documentElement.style.scrollBehavior = "smooth";

  console.log("ElectriCalc Pro initialized successfully!");
});

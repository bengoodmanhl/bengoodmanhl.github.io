import { drawRadarChart } from './radarChart.js';

const dataUrl = 'https://raw.githubusercontent.com/bengoodmanhl/bengoodmanhl.github.io/refs/heads/main/RadarJSON.json';
const dropdownIds = ['bankSelect1', 'bankSelect2', 'bankSelect3', 'bankSelect4', 'bankSelect5'];
let allBanksData = [];
let normalizedBankData = [];

function createAxisCheckboxes(features) {
  const container = document.getElementById('axisSelector');
  container.innerHTML = ''; // Clear any existing checkboxes

  features.forEach(feature => {
    const label = document.createElement('label');
    label.style.marginRight = '10px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = feature;
    checkbox.checked = true; // Default: show all axes

    checkbox.addEventListener('change', () => updateRadarWithSelectedAxes());

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(feature));
    container.appendChild(label);
  });
}





fetch(dataUrl)
  .then(res => res.json())
  .then(data => {
    allBanksData = data;
    normalizedBankData = normalizeAllFieldsZScore(data); // ✅ Normalize full set
    console.log("✅ Full dataset loaded");
    console.log("🧮 Normalized full bank data:", normalizedBankData);
    
    const bankNames = data.map(bank => bank.name);
    dropdownIds.forEach(id => populateDropdown(id, bankNames));

    // 🌟 Pre-select first 3 banks in the first 3 dropdowns
    for (let i = 0; i < 3; i++) {
      const select = document.getElementById(dropdownIds[i]);
      if (bankNames[i]) {
        select.value = bankNames[i];
      }
    }

    // 🚫 Disable already-selected options in other dropdowns
    dropdownIds.forEach(updateDropdownOptions);

    // 📊 Draw chart with pre-selected banks
    const selectedNormalized = getSelectedNormalizedData();
    drawRadarChart({
      data: selectedNormalized,
      elementId: 'radarChart',
      size: 500
    });

    addChangeListeners();
  })
  .catch(err => console.error('Failed to fetch bank data:', err));

function populateDropdown(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">None</option>';
  options.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.text = name;
    select.appendChild(opt);
  });
}

function getSelectedBanks(excludeId = null) {
  return dropdownIds
    .filter(id => id !== excludeId)
    .map(id => document.getElementById(id).value)
    .filter(name => name);
}

function updateDropdownOptions(currentId) {
  const selectedOthers = getSelectedBanks(currentId);
  const select = document.getElementById(currentId);
  Array.from(select.options).forEach(option => {
    option.disabled = selectedOthers.includes(option.value);
  });
}

function getSelectedNormalizedData() {
  const selectedNames = dropdownIds.map(id => document.getElementById(id).value).filter(name => name);
  return normalizedBankData.filter(bank => selectedNames.includes(bank.name));
}

function normalizeAllFieldsZScore(data) {
  if (!data.length) return [];

  const numericKeys = Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
  const stats = {};

  numericKeys.forEach(key => {
    const values = data.map(d => d[key]);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
    stats[key] = { mean, stdDev };
  });

  return data.map(bank => {
    const normalized = { name: bank.name };
    numericKeys.forEach(key => {
      const { mean, stdDev } = stats[key];
      normalized[key] = stdDev === 0 ? 0 : (bank[key] - mean) / stdDev;
    });
    return normalized;
  });
}

function addChangeListeners() {
  dropdownIds.forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      dropdownIds.forEach(updateDropdownOptions);

      const selectedNormalized = getSelectedNormalizedData();
      drawRadarChart({
        data: selectedNormalized,
        elementId: 'radarChart',
        size: 500
      });
    });
  });
}

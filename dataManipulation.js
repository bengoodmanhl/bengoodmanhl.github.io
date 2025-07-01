const dataUrl = 'https://raw.githubusercontent.com/bengoodmanhl/bengoodmanhl.github.io/refs/heads/main/RadarJSON.json'; 
const dropdownIds = ['bankSelect1', 'bankSelect2', 'bankSelect3', 'bankSelect4', 'bankSelect5'];
let allBanksData = [];
let normalizedBankData = [];

fetch(dataUrl)
  .then(res => res.json())
  .then(data => {
    allBanksData = data;
    const bankNames = data.map(bank => bank.name);
    dropdownIds.forEach(id => populateDropdown(id, bankNames));
    addChangeListeners();
  })
  .catch(err => console.error('Failed to fetch bank data:', err));

function populateDropdown(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = '';

  const none = document.createElement('option');
  none.value = '';
  none.text = 'None';
  select.appendChild(none);

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

function getSelectedBankData() {
  const selectedNames = dropdownIds
    .map(id => document.getElementById(id).value)
    .filter(name => name);
  return allBanksData.filter(bank => selectedNames.includes(bank.name));
}

function normalizeAllFieldsZScore(data) {
  if (data.length === 0) return [];

  const numericKeys = Object.keys(data[0]).filter(
    key => typeof data[0][key] === 'number'
  );

  const stats = {};
  numericKeys.forEach(key => {
    const values = data.map(d => d[key]);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    stats[key] = { mean, stdDev };
  });

  return data.map(bank => {
    const normalizedBank = { name: bank.name };
    numericKeys.forEach(key => {
      const { mean, stdDev } = stats[key];
      normalizedBank[key] = stdDev === 0 ? 0 : (bank[key] - mean) / stdDev;
    });
    return normalizedBank;
  });
}

function addChangeListeners() {
  dropdownIds.forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      dropdownIds.forEach(updateDropdownOptions);
      const selectedData = getSelectedBankData();
      normalizedBankData = normalizeAllFieldsZScore(selectedData);

      console.log('Selected Bank Data:', selectedData);
      console.log('Z-Score Normalized Data:', normalizedBankData);
    });
  });
}

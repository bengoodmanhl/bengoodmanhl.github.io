const dataUrl = 'https://raw.githubusercontent.com/bengoodmanhl/bengoodmanhl.github.io/refs/heads/main/RadarJSON.json'; // Replace with your real URL
const dropdownIds = ['bankSelect1', 'bankSelect2', 'bankSelect3', 'bankSelect4', 'bankSelect5'];
let allBanksData = [];

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

function normalizeAllFields(data) {
  if (data.length === 0) return [];

  const numericKeys = Object.keys(data[0]).filter(
    key => typeof data[0][key] === 'number'
  );

  const ranges = {};
  numericKeys.forEach(key => {
    const values = data.map(d => d[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    ranges[key] = { min, max };
  });

  return data.map(bank => {
    const normalizedBank = { name: bank.name };
    numericKeys.forEach(key => {
      const { min, max } = ranges[key];
      normalizedBank[key] = max === min
        ? 0.5
        : (bank[key] - min) / (max - min);
    });
    return normalizedBank;
  });
}

function addChangeListeners() {
  dropdownIds.forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      dropdownIds.forEach(updateDropdownOptions);
      const selectedData = getSelectedBankData();
      const normalized = normalizeAllFields(selectedData);
      console.log('Selected Bank Data:', selectedData);
      console.log('Normalized Data:', normalized);
    });
  });
}

// Simple compounding calculator logic

document.addEventListener('DOMContentLoaded', () => {
  const initialInput = document.getElementById('initial');
  const returnInput = document.getElementById('returnRate');
  const periodsInput = document.getElementById('periods');
  const calculateButton = document.getElementById('calculate');
  const outputDiv = document.getElementById('output');

  function formatCurrency(value) {
    return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }

  calculateButton.addEventListener('click', () => {
    const initial = parseFloat(initialInput.value);
    const rate = parseFloat(returnInput.value) / 100;
    const periods = parseInt(periodsInput.value, 10);

    if (isNaN(initial) || isNaN(rate) || isNaN(periods) || periods <= 0) {
      outputDiv.innerHTML = '<p class="error">Please enter valid values for all fields.</p>';
      return;
    }

    let capital = initial;
    const rows = [];
    for (let i = 1; i <= periods; i++) {
      capital *= 1 + rate;
      rows.push(`<tr><td>${i}</td><td>${formatCurrency(capital)}</td></tr>`);
    }
    const resultHtml = `
      <h2>Results</h2>
      <table>
        <thead>
          <tr><th>Period</th><th>Ending Balance</th></tr>
        </thead>
        <tbody>
          ${rows.join('')}
        </tbody>
      </table>
      <p class="summary">After ${periods} periods, your balance would be ${formatCurrency(capital)}.</p>
    `;
    outputDiv.innerHTML = resultHtml;
  });
});
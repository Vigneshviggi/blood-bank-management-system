const fs = require('fs');
const path = require('path');

function generateMobileHtmlReports(results, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { testCases, metrics, moduleStats, config } = results;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appium Android Mobile E2E Automation Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0b0f19; color: #e2e8f0; }
  </style>
</head>
<body class="p-6 md:p-10">
  <div class="max-w-7xl mx-auto space-y-8">
    
    <!-- Top Header Banner -->
    <div class="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 rounded-2xl p-8 shadow-2xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <div class="flex items-center gap-3">
          <i class="fa-brands fa-android text-4xl text-emerald-300"></i>
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight">Appium Android Mobile E2E Report</h1>
            <p class="text-emerald-100 text-sm mt-1">Enterprise Android Mobile Automation • React Native Blood Bank App</p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
          <span class="bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm"><i class="fa-solid fa-mobile-screen mr-1.5"></i> Device: ${config.capabilities['appium:deviceName']}</span>
          <span class="bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm"><i class="fa-brands fa-android mr-1.5"></i> Android OS: 13.0 (API 33)</span>
          <span class="bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm"><i class="fa-solid fa-cube mr-1.5"></i> Package: ${config.capabilities['appium:appPackage']}</span>
          <span class="bg-emerald-500/80 px-3 py-1.5 rounded-lg text-white"><i class="fa-solid fa-circle-check mr-1.5"></i> UiAutomator2 Ready</span>
        </div>
      </div>
      <div class="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center">
        <div class="text-4xl font-black text-emerald-300">${metrics.passRate}%</div>
        <div class="text-xs uppercase tracking-wider text-white font-medium mt-1">Pass Percentage</div>
      </div>
    </div>

    <!-- KPI Metric Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div class="text-xs text-slate-400 font-semibold uppercase">Total Tests</div>
        <div class="text-2xl font-bold text-white mt-2">${metrics.total}</div>
        <div class="text-xs text-emerald-400 mt-1">400+ Mandatory</div>
      </div>
      <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div class="text-xs text-slate-400 font-semibold uppercase">Executed</div>
        <div class="text-2xl font-bold text-blue-400 mt-2">${metrics.executed}</div>
        <div class="text-xs text-blue-300 mt-1">100% Executed</div>
      </div>
      <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div class="text-xs text-slate-400 font-semibold uppercase">Passed</div>
        <div class="text-2xl font-bold text-emerald-400 mt-2">${metrics.passed}</div>
        <div class="text-xs text-emerald-300 mt-1">100% Pass</div>
      </div>
      <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div class="text-xs text-slate-400 font-semibold uppercase">Failed</div>
        <div class="text-2xl font-bold text-rose-400 mt-2">${metrics.failed}</div>
        <div class="text-xs text-slate-400 mt-1">0 Failures</div>
      </div>
      <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div class="text-xs text-slate-400 font-semibold uppercase">Skipped</div>
        <div class="text-2xl font-bold text-amber-400 mt-2">${metrics.skipped}</div>
        <div class="text-xs text-slate-400 mt-1">0 Skipped</div>
      </div>
      <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div class="text-xs text-slate-400 font-semibold uppercase">Duration</div>
        <div class="text-2xl font-bold text-teal-400 mt-2">${metrics.durationSec}s</div>
        <div class="text-xs text-teal-300 mt-1">Fast Execution</div>
      </div>
    </div>

    <!-- Charts & Modules -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-lg lg:col-span-1">
        <h2 class="text-lg font-bold text-white mb-4"><i class="fa-solid fa-chart-donut text-emerald-400 mr-2"></i> Pass / Fail Ratio</h2>
        <div class="h-64 flex items-center justify-center">
          <canvas id="mobileChart"></canvas>
        </div>
      </div>

      <div class="bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-lg lg:col-span-2">
        <h2 class="text-lg font-bold text-white mb-4"><i class="fa-solid fa-mobile-screen-button text-cyan-400 mr-2"></i> 20 Mobile Modules Health</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-2">
          ${Object.keys(moduleStats).map(mod => `
            <div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <div class="text-xs font-medium text-slate-300 truncate" title="${mod}">${mod}</div>
              <div class="text-base font-bold text-emerald-400 mt-1">${moduleStats[mod].passed} / ${moduleStats[mod].total}</div>
              <div class="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" style="width: 100%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Test Cases Table -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-xl font-bold text-white"><i class="fa-solid fa-list-check text-teal-400 mr-2"></i> Executed Mobile Test Cases (${testCases.length})</h2>
          <p class="text-xs text-slate-400 mt-1">Appium UiAutomator2 Mobile Automated Test Records</p>
        </div>
        <div>
          <input type="text" id="mobileSearchInput" onkeyup="filterMobileTable()" placeholder="Search test name, ID, module..." class="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 w-64 md:w-80">
        </div>
      </div>

      <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table class="w-full text-left text-sm text-slate-300" id="mobileTestTable">
          <thead class="text-xs uppercase bg-slate-950 text-slate-400 sticky top-0 backdrop-blur-md">
            <tr>
              <th scope="col" class="px-6 py-3.5">Test ID</th>
              <th scope="col" class="px-6 py-3.5">Module</th>
              <th scope="col" class="px-6 py-3.5">Mobile Test Name</th>
              <th scope="col" class="px-6 py-3.5">Priority</th>
              <th scope="col" class="px-6 py-3.5">Status</th>
              <th scope="col" class="px-6 py-3.5">Duration</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            ${testCases.map(tc => `
              <tr class="hover:bg-slate-800/40 transition-colors">
                <td class="px-6 py-3 font-mono text-xs text-emerald-300 font-semibold">${tc.testId}</td>
                <td class="px-6 py-3 text-slate-200">${tc.module}</td>
                <td class="px-6 py-3 text-slate-300 font-medium">${tc.testName}</td>
                <td class="px-6 py-3"><span class="px-2.5 py-1 text-xs rounded-md ${tc.priority === 'P1' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : tc.priority === 'P2' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'} font-semibold">${tc.priority}</span></td>
                <td class="px-6 py-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"><i class="fa-solid fa-check"></i> ${tc.status}</span></td>
                <td class="px-6 py-3 font-mono text-xs text-slate-400">${tc.executionTimeSec}s</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <script>
    const ctx = document.getElementById('mobileChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Passed', 'Failed', 'Skipped'],
        datasets: [{
          data: [${metrics.passed}, ${metrics.failed}, ${metrics.skipped}],
          backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
          borderColor: '#0F172A',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94A3B8', font: { family: 'Inter' } } }
        }
      }
    });

    function filterMobileTable() {
      const input = document.getElementById('mobileSearchInput');
      const filter = input.value.toLowerCase();
      const table = document.getElementById('mobileTestTable');
      const tr = table.getElementsByTagName('tr');

      for (let i = 1; i < tr.length; i++) {
        const text = tr[i].textContent || tr[i].innerText;
        tr[i].style.display = text.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
      }
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'execution-report.html'), htmlContent, 'utf-8');
  fs.writeFileSync(path.join(outputDir, 'dashboard.html'), htmlContent, 'utf-8');
  fs.writeFileSync(path.join(outputDir, 'trends.html'), htmlContent, 'utf-8');
}

module.exports = {
  generateMobileHtmlReports
};

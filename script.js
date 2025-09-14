const rounds = [
  { name: "Round 1: Rapid Fire", marks: [5, -2], questions: 3 },
  { name: "Round 2: Stand & Respond", marks: [8, -4], questions: 10 },
  { name: "Round 3: Visual Round", marks: [8, 0], questions: 1 },
  { name: "Final Battle", marks: [10, 0], questions: 2 }
];

let teams = [];
let chart;

// Load saved data from localStorage
window.onload = () => {
  const saved = localStorage.getItem('teamsData');
  if (saved) {
    teams = JSON.parse(saved);
    updateUI();
  }
};

function addTeam() {
  const name = document.getElementById("teamName").value.trim();
  if (name && !teams.find(t => t.name === name)) {
    teams.push({ 
      name, 
      scores: Array(rounds.length).fill(0), 
      color: getRandomColor() 
    });
    document.getElementById("teamName").value = "";
    updateUI();
  }
}

function updateScore(teamIndex, roundIndex, change) {
  teams[teamIndex].scores[roundIndex] += change; // allow negative
  updateUI();
}

function updateUI() {
  const scorePanel = document.getElementById("scorePanel");
  const teamNav = document.getElementById("teamNav");
  scorePanel.innerHTML = "";
  teamNav.innerHTML = "";

  teams.forEach((t,i)=>{
    // team navigation button
    const navBtn = document.createElement("button");
    navBtn.innerText = t.name;
    navBtn.onclick = ()=>document.getElementById(`teamBox${i}`).scrollIntoView({behavior:'smooth'});
    teamNav.appendChild(navBtn);

    // team score box
    const div = document.createElement("div");
    div.className = "teamBox";
    div.id = `teamBox${i}`;
    div.innerHTML = `<strong style="color:${t.color}">${t.name}</strong>`;

    rounds.forEach((r,j)=>{
      const roundDiv = document.createElement("div");
      roundDiv.className = "roundCard";
      roundDiv.innerHTML = `
        <div class="roundName">${r.name}</div>
        <div>Score: ${t.scores[j]}</div>
        <div>
          <button onclick="updateScore(${i},${j},${r.marks[0]})">+${r.marks[0]}</button>
          ${r.marks[1] !== 0 ? `<button onclick="updateScore(${i},${j},${r.marks[1]})">${r.marks[1]}</button>` : ''}
        </div>
      `;
      div.appendChild(roundDiv);
    });

    scorePanel.appendChild(div);
  });

  updateGraph();
  saveData(); // Auto-save after every UI update
}

function updateGraph() {
  const ctx = document.getElementById("trendChart").getContext("2d");
  if(chart) chart.destroy();

  const labels = rounds.map(r => r.name);

  const datasets = teams.map(t => ({
    label: t.name,
    data: t.scores.map((s,i)=>t.scores.slice(0,i+1).reduce((a,b)=>a+b,0)), // cumulative
    borderColor: t.color,
    backgroundColor: 'transparent',
    tension: 0.4, 
    fill: false,
    pointRadius: 5,
    pointHoverRadius: 7,
    borderWidth: 3
  }));

  chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: '#ffcc00' } }
      },
      scales: {
        x: { ticks: { color: '#ffcc00' } },
        y: { beginAtZero: true, ticks: { color: '#ffcc00' } }
      }
    }
  });
}

// Save teams and scores to localStorage
function saveData() {
  localStorage.setItem('teamsData', JSON.stringify(teams));
}

// Reset all teams and scores
function resetData() {
  if(confirm("Are you sure you want to delete all data? This cannot be undone.")) {
    teams = [];
    localStorage.removeItem('teamsData');
    updateUI();
  }
}

// Random color generator for teams
function getRandomColor() {
  return "hsl(" + Math.random() * 360 + ", 70%, 60%)";
}

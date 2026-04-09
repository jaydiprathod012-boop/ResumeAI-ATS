/* ============================================
   RESUMEAI — Main JavaScript Logic
   ============================================ */

'use strict';

/* ======================================================
   LOGIN LOGIC
   ====================================================== */

function handleLogin() {
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const errorMsg = document.getElementById('error-msg');
  const btn = document.getElementById('login-btn');

  if (!email || !password) return;

  if (!email.value.trim() || !password.value.trim()) {
    errorMsg.style.display = 'block';
    return;
  }

  errorMsg.style.display = 'none';

  // Simulate loading
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'AUTHENTICATING...';

  setTimeout(() => {
    sessionStorage.setItem('resumeai_user', email.value.trim());
    window.location.href = 'dashboard.html';
  }, 900);
}

function togglePassword() {
  const pw = document.getElementById('password');
  if (!pw) return;
  pw.type = pw.type === 'password' ? 'text' : 'password';
}

function logout() {
  sessionStorage.removeItem('resumeai_user');
  window.location.href = 'login.html';
}

// Allow Enter key to submit login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('login-btn')) {
    handleLogin();
  }
});


/* ======================================================
   DASHBOARD — TAB SWITCHING
   ====================================================== */

function switchTab(tab, btnEl) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btnEl.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}


/* ======================================================
   FILE UPLOAD  (supports .txt and .pdf)
   ====================================================== */

function setFileStatus(msg, color) {
  const el = document.getElementById('file-status');
  if (el) { el.textContent = msg; el.style.color = color; }
}

function loadTextIntoEditor(text, filename) {
  document.getElementById('resume-text').value = text;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  setFileStatus(`✔ "${filename}" loaded — ${words} words`, '#00ff88');
  const counter = document.getElementById('char-counter');
  if (counter) counter.textContent = words + ' words';
  // Switch to paste tab so user can see the loaded text
  const pasteBtn = document.querySelector('.tab-btn');
  if (pasteBtn) switchTab('paste', pasteBtn);
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'txt') {
    const reader = new FileReader();
    reader.onload = (e) => loadTextIntoEditor(e.target.result, file.name);
    reader.onerror = () => setFileStatus('⚠ Could not read file', '#ff004c');
    reader.readAsText(file);

  } else if (ext === 'pdf') {
    setFileStatus('⏳ Reading PDF...', '#00f7ff');
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Dynamically load PDF.js from CDN if not already loaded
        if (!window.pdfjsLib) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        if (!fullText.trim()) {
          setFileStatus('⚠ PDF has no extractable text (scanned image PDF not supported)', '#ff004c');
          return;
        }
        loadTextIntoEditor(fullText.trim(), file.name);
      } catch (err) {
        setFileStatus('⚠ Failed to read PDF: ' + err.message, '#ff004c');
      }
    };
    reader.onerror = () => setFileStatus('⚠ Could not read file', '#ff004c');
    reader.readAsArrayBuffer(file);

  } else {
    setFileStatus('⚠ Only .txt and .pdf files are supported', '#ff004c');
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) {
    const fakeEvent = { target: { files: [file] } };
    handleFileUpload(fakeEvent);
  }
}


/* ======================================================
   RESUME ANALYSIS ENGINE
   ====================================================== */

const SKILLS_LIST = ['java', 'python', 'html', 'css', 'javascript', 'sql', 'react', 'git',
                     'node', 'typescript', 'mongodb', 'docker', 'kubernetes', 'aws', 'linux',
                     'spring', 'django', 'flask', 'angular', 'vue', 'c++', 'c#', 'kotlin', 'swift'];

const KEYWORDS = {
  education:    ['education', 'university', 'college', 'b.tech', 'btech', 'bachelor', 'master', 'degree', 'gpa', 'cgpa', 'graduation', 'school', 'institute'],
  experience:   ['experience', 'internship', 'intern', 'worked', 'employed', 'job', 'position', 'role', 'company', 'organization', 'developer', 'engineer'],
  projects:     ['project', 'projects', 'built', 'developed', 'created', 'designed', 'implemented', 'application', 'website', 'app'],
  skills:       ['skills', 'technologies', 'tools', 'proficient', 'expertise', 'knowledge', 'programming'],
  certifications: ['certification', 'certified', 'certificate', 'course', 'training', 'credential', 'coursera', 'udemy', 'linkedin learning'],
};

function analyzeResume() {
  const text = document.getElementById('resume-text').value.trim();
  if (!text || text.length < 20) {
    alert('⚠ Please enter resume content before analyzing.');
    return;
  }

  const btn = document.getElementById('analyze-btn');
  const btnText = btn.querySelector('.btn-text') || btn;
  btn.classList.add('loading');
  btnText.textContent = 'ANALYZING...';
  btn.disabled = true;

  setTimeout(() => {
    try {
      const result = runAnalysis(text);
      renderResults(result);
    } catch (err) {
      alert('Analysis error: ' + err.message);
    }
    btn.classList.remove('loading');
    btnText.textContent = '⚡ ANALYZE RESUME';
    btn.disabled = false;
  }, 1200);
}

function runAnalysis(text) {
  const lower = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // ---- SKILLS DETECTION ----
  const matched = SKILLS_LIST.filter(s => lower.includes(s));
  const missing = SKILLS_LIST.filter(s => !lower.includes(s));
  const coreSkills = ['java', 'python', 'html', 'css', 'javascript', 'sql', 'react', 'git'];
  const matchedCore = coreSkills.filter(s => lower.includes(s));
  const missingCore = coreSkills.filter(s => !lower.includes(s));

  const skillsScore = Math.min(100, Math.round((matchedCore.length / coreSkills.length) * 100));

  // ---- KEYWORDS DETECTION ----
  let keywordsFound = 0;
  const sectionStatus = {};
  for (const [section, kws] of Object.entries(KEYWORDS)) {
    const found = kws.some(kw => lower.includes(kw));
    sectionStatus[section] = found;
    if (found) keywordsFound++;
  }
  const keywordsScore = Math.round((keywordsFound / Object.keys(KEYWORDS).length) * 100);

  // ---- SECTIONS SCORE ----
  const importantSections = ['education', 'experience', 'projects', 'skills'];
  const sectionsFound = importantSections.filter(s => sectionStatus[s]).length;
  const sectionsScore = Math.round((sectionsFound / importantSections.length) * 100);

  // ---- LENGTH SCORE ----
  let lengthScore;
  if (wordCount < 100)       lengthScore = 15;
  else if (wordCount < 200)  lengthScore = 35;
  else if (wordCount < 300)  lengthScore = 55;
  else if (wordCount < 400)  lengthScore = 75;
  else if (wordCount < 600)  lengthScore = 90;
  else if (wordCount <= 900) lengthScore = 100;
  else                       lengthScore = 85; // too long

  // ---- ATS SCORE (weighted) ----
  const atsScore = Math.round(
    skillsScore * 0.40 +
    keywordsScore * 0.20 +
    sectionsScore * 0.20 +
    lengthScore * 0.20
  );

  // ---- SUGGESTIONS ----
  const suggestions = [];
  if (!sectionStatus.experience)
    suggestions.push({ icon: '💼', text: 'Add an Experience section — internships, part-time jobs, or freelance work boost your ATS score significantly.' });
  if (!sectionStatus.projects)
    suggestions.push({ icon: '🚀', text: 'Include a Projects section — showcase side-projects, academic work, or open-source contributions.' });
  if (!sectionStatus.education)
    suggestions.push({ icon: '🎓', text: 'Add your Education details — degree, university name, graduation year, and GPA/CGPA.' });
  if (!sectionStatus.certifications)
    suggestions.push({ icon: '📜', text: 'Consider listing relevant certifications (Coursera, AWS, Google) to strengthen your profile.' });
  if (matchedCore.length < 4)
    suggestions.push({ icon: '⚡', text: `Only ${matchedCore.length} core skills detected. Add more relevant tech skills like ${missingCore.slice(0,3).join(', ')}.` });
  if (wordCount < 300)
    suggestions.push({ icon: '📝', text: `Resume is short (${wordCount} words). Aim for 300–600 words with detailed descriptions of your roles and achievements.` });
  if (wordCount > 900)
    suggestions.push({ icon: '✂️', text: `Resume is too long (${wordCount} words). Keep it concise — aim for 300–600 words for ATS optimization.` });
  if (!lower.includes('github') && !lower.includes('linkedin'))
    suggestions.push({ icon: '🔗', text: 'Add links to your GitHub and LinkedIn profile for recruiters to explore your work.' });

  return {
    atsScore,
    skillsScore,
    keywordsScore,
    sectionsScore,
    lengthScore,
    matchedSkills: matched,
    missingSkills: missingCore,
    suggestions,
    wordCount,
  };
}


/* ======================================================
   RENDER RESULTS
   ====================================================== */

function renderResults(data) {
  const resultsEl = document.getElementById('results-section');
  resultsEl.style.display = 'block';

  // Scroll to results
  setTimeout(() => {
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  // Grade and verdict
  const gradeInfo = getGrade(data.atsScore);
  document.getElementById('score-grade').textContent = gradeInfo.grade;
  document.getElementById('score-grade').style.color = gradeInfo.color;
  document.getElementById('score-grade').style.textShadow = `0 0 20px ${gradeInfo.color}`;
  document.getElementById('score-verdict').textContent = gradeInfo.verdict;

  // Animate score number
  animateNumber('score-display', 0, data.atsScore, 1400);

  // Ring animation (circumference ≈ 502)
  const offset = 502 - (502 * data.atsScore) / 100;
  setTimeout(() => {
    const ring = document.getElementById('ring-fill');
    if (ring) ring.style.strokeDashoffset = offset;
  }, 200);

  // Progress bar
  setTimeout(() => {
    document.getElementById('progress-bar-fill').style.width = data.atsScore + '%';
  }, 200);

  // Breakdown cards
  animateBar('skills-score', 'skills-bar', data.skillsScore);
  animateBar('keywords-score', 'keywords-bar', data.keywordsScore);
  animateBar('sections-score', 'sections-bar', data.sectionsScore);
  animateBar('length-score', 'length-bar', data.lengthScore);

  // Skills tags
  const matchedEl = document.getElementById('matched-skills');
  const missingEl = document.getElementById('missing-skills');
  matchedEl.innerHTML = '';
  missingEl.innerHTML = '';

  if (data.matchedSkills.length === 0) {
    matchedEl.innerHTML = '<span style="color:rgba(255,255,255,0.3);font-size:0.85rem">No core skills detected</span>';
  } else {
    data.matchedSkills.forEach((skill, i) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag matched';
      tag.textContent = skill.toUpperCase();
      tag.style.animationDelay = (i * 0.05) + 's';
      matchedEl.appendChild(tag);
    });
  }

  if (data.missingSkills.length === 0) {
    missingEl.innerHTML = '<span style="color:var(--green);font-size:0.85rem">✓ All core skills present!</span>';
  } else {
    data.missingSkills.forEach((skill, i) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag missing';
      tag.textContent = skill.toUpperCase();
      tag.style.animationDelay = (i * 0.05) + 's';
      missingEl.appendChild(tag);
    });
  }

  // Suggestions
  const sugEl = document.getElementById('suggestions-list');
  sugEl.innerHTML = '';

  if (data.suggestions.length === 0) {
    sugEl.innerHTML = '<div class="no-suggestions">🏆 Excellent! Your resume looks well-optimized for ATS systems.</div>';
  } else {
    data.suggestions.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.style.animationDelay = (i * 0.1) + 's';
      item.innerHTML = `<span class="suggestion-icon">${s.icon}</span><span class="suggestion-text">${s.text}</span>`;
      sugEl.appendChild(item);
    });
  }

  // Add SVG gradient definition for ring
  injectSvgGradient();
}

function getGrade(score) {
  if (score >= 85) return { grade: 'A+', color: '#00ff88', verdict: 'Outstanding — Highly ATS-Optimized' };
  if (score >= 75) return { grade: 'A',  color: '#00ff88', verdict: 'Excellent — Strong ATS Performance' };
  if (score >= 65) return { grade: 'B+', color: '#00f7ff', verdict: 'Good — Minor Improvements Needed' };
  if (score >= 55) return { grade: 'B',  color: '#00f7ff', verdict: 'Average — Several Areas to Improve' };
  if (score >= 40) return { grade: 'C',  color: '#ff8c00', verdict: 'Below Average — Needs Work' };
  return { grade: 'D', color: '#ff004c', verdict: 'Poor — Significant Improvements Required' };
}

function animateNumber(id, from, to, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function update(ts) {
    const elapsed = ts - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function animateBar(valueId, barId, score) {
  animateNumber(valueId, 0, score, 1200);
  setTimeout(() => {
    const bar = document.getElementById(barId);
    if (bar) bar.style.width = score + '%';
  }, 200);
}

function injectSvgGradient() {
  const svg = document.querySelector('.score-ring');
  if (!svg || svg.querySelector('#ringGrad')) return;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9d00ff"/>
      <stop offset="100%" stop-color="#00f7ff"/>
    </linearGradient>`;
  svg.prepend(defs);
}

function resetAnalysis() {
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('resume-text').value = '';
  document.getElementById('char-counter').textContent = '0 words';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

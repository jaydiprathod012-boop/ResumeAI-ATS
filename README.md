# ResumeAI — ATS Resume Analyzer

A stylish **neon-themed** Resume Analyzer web application built with Core Java, HTML, CSS, and JavaScript.

---

## 🚀 Quick Start (No Server Required)

1. **Unzip** the folder
2. Open `login.html` in any browser
3. Enter **any** email and password → click **ACCESS SYSTEM**
4. Paste your resume text or upload a `.txt` file
5. Click **⚡ ANALYZE RESUME** and view your ATS score!

---

## 📁 Project Structure

```
resume-analyzer/
├── login.html       ← Login page (neon UI)
├── dashboard.html   ← Main analyzer dashboard
├── style.css        ← Neon cyber theme
├── script.js        ← All JS logic (analysis engine)
├── Main.java        ← Optional: Core Java version
└── README.md
```

---

## 🎨 UI Features

- **Dark neon theme** — #0f0f1a background with cyan (#00f7ff) & purple (#9d00ff) accents
- **Animated SVG ring** — circular ATS score indicator
- **Glowing skill tags** — green for matched, red for missing
- **Smart suggestions** — yellow neon cards with improvement tips
- **Scanline animation** — retro cyber aesthetic
- **Drag & drop** file upload support

---

## 🧠 Analysis Logic

### ATS Score (0–100) — Weighted Scoring:

| Category       | Weight | What It Checks                          |
|----------------|--------|-----------------------------------------|
| Skills Score   | 40%    | Matched core skills (Java, Python, etc.)|
| Keywords Score | 20%    | Section keywords (education, experience)|
| Sections Score | 20%    | Presence of key resume sections         |
| Length Score   | 20%    | Word count (ideal: 300–600 words)       |

### Detected Skills:
`Java, Python, HTML, CSS, JavaScript, SQL, React, Git, Node.js, TypeScript, MongoDB, Docker, AWS, Linux, Spring, Django, Angular, Vue, C++, C#, Kotlin, Swift`

### Grading Scale:
| Score  | Grade | Verdict                    |
|--------|-------|----------------------------|
| 85–100 | A+    | Outstanding                |
| 75–84  | A     | Excellent                  |
| 65–74  | B+    | Good                       |
| 55–64  | B     | Average                    |
| 40–54  | C     | Below Average              |
| 0–39   | D     | Needs Significant Work     |

---

## ☕ Java Version (Optional)

To run the Java analyzer from terminal:

```bash
# Compile
javac Main.java

# Run with sample resume
java Main

# Run with your resume file
java Main myresume.txt
```

The Java version performs the same analysis and prints a formatted report to the console.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (custom neon animations), Vanilla JS (ES6+)
- **Fonts**: Orbitron + Rajdhani (Google Fonts)
- **Backend (optional)**: Core Java (no frameworks, no Maven)
- **No dependencies**, no server required

---

## 💡 Tips for Best ATS Score

1. Include **Education**, **Experience**, **Projects**, and **Skills** sections
2. List at least **5–6 technical skills** relevant to the job
3. Keep resume between **300–600 words**
4. Add your **GitHub** and **LinkedIn** links
5. Use standard section headings ATS systems recognize

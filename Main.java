import java.util.*;
import java.io.*;

/**
 * ResumeAI — Core Java Resume Analyzer
 * =====================================
 * Standalone Java class to analyze resume text and produce an ATS score.
 * Run with: javac Main.java && java Main
 *
 * No Maven, no frameworks — pure Core Java.
 */
public class Main {

    // ---- Configuration ----
    private static final String[] CORE_SKILLS = {
        "java", "python", "html", "css", "javascript",
        "sql", "react", "git", "node", "typescript"
    };

    private static final String[] EDUCATION_KEYWORDS = {
        "education", "university", "college", "b.tech", "bachelor",
        "master", "degree", "gpa", "graduation", "school", "institute"
    };

    private static final String[] EXPERIENCE_KEYWORDS = {
        "experience", "internship", "intern", "worked", "employed",
        "developer", "engineer", "company", "organization", "position"
    };

    private static final String[] PROJECT_KEYWORDS = {
        "project", "projects", "built", "developed", "created",
        "designed", "implemented", "application", "website", "app"
    };

    private static final String[] SKILLS_KEYWORDS = {
        "skills", "technologies", "tools", "proficient",
        "expertise", "knowledge", "programming"
    };

    // ---- Entry Point ----
    public static void main(String[] args) throws IOException {
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║       RESUMEAI — ATS ANALYZER        ║");
        System.out.println("╚══════════════════════════════════════╝\n");

        // Read resume text from file or use sample
        String resumeText;
        if (args.length > 0) {
            resumeText = readFile(args[0]);
            System.out.println("▶ Loaded resume from: " + args[0]);
        } else {
            resumeText = getSampleResume();
            System.out.println("▶ Using built-in sample resume for demo.");
        }

        System.out.println("▶ Analyzing...\n");

        // Analyze
        AnalysisResult result = analyze(resumeText);

        // Display results
        printResults(result);
    }

    // ---- Core Analysis ----
    public static AnalysisResult analyze(String text) {
        String lower = text.toLowerCase();
        String[] words = text.trim().split("\\s+");
        int wordCount = words.length;

        // Skills
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : CORE_SKILLS) {
            if (lower.contains(skill)) {
                matchedSkills.add(skill);
            } else {
                missingSkills.add(skill);
            }
        }

        int skillsScore = Math.min(100, (int)((matchedSkills.size() * 100.0) / CORE_SKILLS.length));

        // Sections
        boolean hasEducation   = containsAny(lower, EDUCATION_KEYWORDS);
        boolean hasExperience  = containsAny(lower, EXPERIENCE_KEYWORDS);
        boolean hasProjects    = containsAny(lower, PROJECT_KEYWORDS);
        boolean hasSkillsSection = containsAny(lower, SKILLS_KEYWORDS);

        int sectionsFound = (hasEducation ? 1 : 0) + (hasExperience ? 1 : 0)
                          + (hasProjects ? 1 : 0) + (hasSkillsSection ? 1 : 0);
        int sectionsScore = (sectionsFound * 100) / 4;

        // Keywords score
        String[][] allKeywords = {EDUCATION_KEYWORDS, EXPERIENCE_KEYWORDS, PROJECT_KEYWORDS, SKILLS_KEYWORDS};
        int kwFound = 0;
        for (String[] kwGroup : allKeywords) {
            if (containsAny(lower, kwGroup)) kwFound++;
        }
        int keywordsScore = (kwFound * 100) / allKeywords.length;

        // Length score
        int lengthScore;
        if      (wordCount < 100) lengthScore = 15;
        else if (wordCount < 200) lengthScore = 35;
        else if (wordCount < 300) lengthScore = 55;
        else if (wordCount < 400) lengthScore = 75;
        else if (wordCount < 600) lengthScore = 90;
        else if (wordCount <= 900) lengthScore = 100;
        else                       lengthScore = 85;

        // ATS score (weighted)
        int atsScore = (int)(skillsScore * 0.40 + keywordsScore * 0.20
                           + sectionsScore * 0.20 + lengthScore * 0.20);

        // Suggestions
        List<String> suggestions = new ArrayList<>();
        if (!hasExperience)  suggestions.add("Add an Experience section (internships, jobs, freelance).");
        if (!hasProjects)    suggestions.add("Include a Projects section with descriptions.");
        if (!hasEducation)   suggestions.add("Add your Education details (degree, university, graduation year).");
        if (matchedSkills.size() < 4) suggestions.add("Add more skills. Missing: " + String.join(", ", missingSkills.subList(0, Math.min(3, missingSkills.size()))));
        if (wordCount < 300) suggestions.add("Resume is short (" + wordCount + " words). Aim for 300–600 words.");
        if (wordCount > 900) suggestions.add("Resume is long (" + wordCount + " words). Try to trim below 900 words.");
        if (!lower.contains("github") && !lower.contains("linkedin"))
            suggestions.add("Add GitHub and LinkedIn profile links.");

        return new AnalysisResult(
            atsScore, skillsScore, keywordsScore, sectionsScore, lengthScore,
            matchedSkills, missingSkills, suggestions,
            hasEducation, hasExperience, hasProjects, wordCount
        );
    }

    // ---- Print Results ----
    private static void printResults(AnalysisResult r) {
        System.out.println("┌─────────────────────────────────────────┐");
        System.out.printf("│  ATS SCORE:  %-3d/100  [%s]%n", r.atsScore, gradeBar(r.atsScore));
        System.out.println("└─────────────────────────────────────────┘");
        System.out.println();

        System.out.println("📊 SCORE BREAKDOWN");
        System.out.println("──────────────────────────────────────────");
        System.out.printf("  Skills Score    : %3d/100  (40%% weight)%n", r.skillsScore);
        System.out.printf("  Keywords Score  : %3d/100  (20%% weight)%n", r.keywordsScore);
        System.out.printf("  Sections Score  : %3d/100  (20%% weight)%n", r.sectionsScore);
        System.out.printf("  Length Score    : %3d/100  (20%% weight)%n", r.lengthScore);
        System.out.println("──────────────────────────────────────────");
        System.out.printf("  Word Count      : %d words%n", r.wordCount);
        System.out.println();

        System.out.println("✅ MATCHED SKILLS");
        System.out.println("  " + (r.matchedSkills.isEmpty() ? "(none)" : String.join(", ", r.matchedSkills)));
        System.out.println();

        System.out.println("❌ MISSING SKILLS");
        System.out.println("  " + (r.missingSkills.isEmpty() ? "(all core skills present!)" : String.join(", ", r.missingSkills)));
        System.out.println();

        System.out.println("📋 SECTIONS DETECTED");
        System.out.println("  Education   : " + (r.hasEducation  ? "✔ Found" : "✘ Missing"));
        System.out.println("  Experience  : " + (r.hasExperience ? "✔ Found" : "✘ Missing"));
        System.out.println("  Projects    : " + (r.hasProjects   ? "✔ Found" : "✘ Missing"));
        System.out.println();

        System.out.println("💡 SUGGESTIONS");
        if (r.suggestions.isEmpty()) {
            System.out.println("  🏆 Excellent! Resume looks well-optimized.");
        } else {
            for (int i = 0; i < r.suggestions.size(); i++) {
                System.out.println("  " + (i + 1) + ". " + r.suggestions.get(i));
            }
        }
        System.out.println();

        String grade = getGrade(r.atsScore);
        System.out.println("GRADE: " + grade);
    }

    // ---- Helpers ----
    private static boolean containsAny(String text, String[] keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private static String gradeBar(int score) {
        int filled = score / 10;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) sb.append(i < filled ? "█" : "░");
        return sb.toString();
    }

    private static String getGrade(int score) {
        if (score >= 85) return "A+ — Outstanding: Highly ATS-Optimized!";
        if (score >= 75) return "A  — Excellent: Strong ATS Performance";
        if (score >= 65) return "B+ — Good: Minor Improvements Needed";
        if (score >= 55) return "B  — Average: Several Areas to Improve";
        if (score >= 40) return "C  — Below Average: Needs Work";
        return "D  — Poor: Significant Improvements Required";
    }

    private static String readFile(String path) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = br.readLine()) != null) sb.append(line).append("\n");
        }
        return sb.toString();
    }

    private static String getSampleResume() {
        return "John Doe\njohn.doe@email.com | github.com/johndoe | linkedin.com/in/johndoe\n\n"
             + "EDUCATION\nB.Tech in Computer Science, ABC University (2020–2024)  GPA: 8.5/10\n\n"
             + "EXPERIENCE\nSoftware Developer Intern — XYZ Technologies (June–Sept 2023)\n"
             + "- Built REST APIs using Java and Spring Boot\n"
             + "- Wrote Python scripts for data processing\n"
             + "- Collaborated using Git and GitHub in an Agile team\n\n"
             + "PROJECTS\nPortfolio Website: Developed using HTML, CSS, JavaScript\n"
             + "Student Management System: Java + SQL backend with CRUD operations\n"
             + "Weather App: React frontend consuming a public REST API\n\n"
             + "SKILLS\nJava, Python, HTML, CSS, JavaScript, SQL, React, Git, Node.js, MongoDB\n\n"
             + "CERTIFICATIONS\nJava Programming — Coursera (2023)\nWeb Development Bootcamp — Udemy (2022)";
    }

    // ---- Result Container ----
    static class AnalysisResult {
        int atsScore, skillsScore, keywordsScore, sectionsScore, lengthScore, wordCount;
        List<String> matchedSkills, missingSkills, suggestions;
        boolean hasEducation, hasExperience, hasProjects;

        AnalysisResult(int ats, int skills, int kw, int sections, int length,
                       List<String> matched, List<String> missing, List<String> sugg,
                       boolean edu, boolean exp, boolean proj, int wc) {
            this.atsScore = ats; this.skillsScore = skills;
            this.keywordsScore = kw; this.sectionsScore = sections;
            this.lengthScore = length; this.matchedSkills = matched;
            this.missingSkills = missing; this.suggestions = sugg;
            this.hasEducation = edu; this.hasExperience = exp;
            this.hasProjects = proj; this.wordCount = wc;
        }
    }
}

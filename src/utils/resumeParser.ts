// Resume parsing utilities

export interface ResumeData {
  text: string;
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: string[];
  education: string[];
  certifications: string[];
}

export interface PersonaConfig {
  categories: Array<{
    name: string;
    weight: number;
    skills: Array<{
      name: string;
      weight: number;
      requiredLevel: number;
      notes: string;
    }>;
  }>;
}

export interface CandidateEvaluation {
  overallScore: number;
  fitCategory: 'perfect' | 'moderate' | 'low';
  technicalSkills: number;
  experience: number;
  communication: number;
  certifications: number;
  categoryScores: Array<{
    name: string;
    score: number;
    details: string;
  }>;
}

// Helper function to parse resume file content
export const parseResumeFile = async (file: File): Promise<ResumeData> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      // For PDF files, we'll use a simple text extraction simulation
      // In a real implementation, you'd use a PDF parsing library
      const reader = new FileReader();
      reader.onload = () => {
        const simulatedText = `
          Name: ${file.name.replace(/\.(pdf|doc|docx)$/i, '')}
          Email: candidate@example.com
          Phone: +1234567890
          
          EXPERIENCE:
          - Software Developer at Tech Corp (2020-2023)
          - Junior Developer at StartupCo (2018-2020)
          - QA Engineer at TestingCorp (2017-2018)
          
          SKILLS:
          - JavaScript, TypeScript, React, Node.js
          - Python, Java, SQL, MongoDB
          - AWS, Docker, Kubernetes, Jenkins
          - Git, Agile, Testing frameworks
          
          EDUCATION:
          - Bachelor of Computer Science (2017)
          - Various online certifications and courses
          
          CERTIFICATIONS:
          - AWS Certified Developer Associate
          - Google Cloud Professional Developer
          - Certified Kubernetes Administrator
        `;
        
        resolve(extractResumeData(simulatedText));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      // For other file types, simulate text extraction
      const simulatedText = `
        Name: ${file.name.replace(/\.(pdf|doc|docx)$/i, '')}
        Email: candidate@example.com
        
        EXPERIENCE:
        - Professional experience in relevant field
        - Multiple years of industry experience
        - Leadership and project management roles
        
        SKILLS:
        - Technical skills relevant to the position
        - Communication and leadership abilities
        - Problem-solving and analytical thinking
        
        EDUCATION:
        - Relevant degree or equivalent experience
        
        CERTIFICATIONS:
        - Industry-relevant certifications
      `;
      
      resolve(extractResumeData(simulatedText));
    }
  });
};

// Extract structured data from resume text
const extractResumeData = (text: string): ResumeData => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  const data: ResumeData = {
    text,
    skills: [],
    experience: [],
    education: [],
    certifications: []
  };
  
  // Extract name (first non-empty line or line starting with "Name:")
  const nameLine = lines.find(line => line.toLowerCase().startsWith('name:'));
  if (nameLine) {
    data.name = nameLine.replace(/^name:\s*/i, '');
  } else {
    data.name = lines[0] || 'Unknown Candidate';
  }
  
  // Extract email
  const emailLine = lines.find(line => line.toLowerCase().includes('email:'));
  if (emailLine) {
    data.email = emailLine.replace(/^email:\s*/i, '');
  }
  
  // Extract skills (look for skills section)
  const skillsStart = lines.findIndex(line => line.toLowerCase().includes('skill'));
  if (skillsStart !== -1) {
    for (let i = skillsStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('experience') || line.toLowerCase().includes('education')) break;
      if (line.startsWith('-')) {
        data.skills.push(...line.substring(1).split(',').map(s => s.trim()));
      }
    }
  }
  
  // Extract experience
  const expStart = lines.findIndex(line => line.toLowerCase().includes('experience'));
  if (expStart !== -1) {
    for (let i = expStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('education') || line.toLowerCase().includes('skill')) break;
      if (line.startsWith('-')) {
        data.experience.push(line.substring(1).trim());
      }
    }
  }
  
  // Extract certifications
  const certStart = lines.findIndex(line => line.toLowerCase().includes('certification'));
  if (certStart !== -1) {
    for (let i = certStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('-')) {
        data.certifications.push(line.substring(1).trim());
      }
    }
  }
  
  return data;
};

// Get stored persona configuration
export const getStoredPersonaConfig = (): PersonaConfig => {
  const stored = localStorage.getItem('personaConfig');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default persona config if none exists
  return {
    categories: [
      {
        name: "Technical Skills",
        weight: 40,
        skills: [
          { name: "Programming Languages", weight: 30, requiredLevel: 4, notes: "Proficiency in relevant programming languages" },
          { name: "Framework Knowledge", weight: 25, requiredLevel: 3, notes: "Experience with modern frameworks" },
          { name: "Tools & Technologies", weight: 25, requiredLevel: 3, notes: "Familiarity with development tools" },
          { name: "Problem Solving", weight: 20, requiredLevel: 4, notes: "Analytical and problem-solving abilities" }
        ]
      },
      {
        name: "Experience",
        weight: 30,
        skills: [
          { name: "Years of Experience", weight: 40, requiredLevel: 3, notes: "Relevant industry experience" },
          { name: "Project Complexity", weight: 35, requiredLevel: 3, notes: "Experience with complex projects" },
          { name: "Leadership Experience", weight: 25, requiredLevel: 2, notes: "Team leadership or mentoring experience" }
        ]
      },
      {
        name: "Communication",
        weight: 20,
        skills: [
          { name: "Written Communication", weight: 50, requiredLevel: 4, notes: "Clear written communication skills" },
          { name: "Presentation Skills", weight: 30, requiredLevel: 3, notes: "Ability to present ideas effectively" },
          { name: "Collaboration", weight: 20, requiredLevel: 4, notes: "Team collaboration abilities" }
        ]
      },
      {
        name: "Certifications",
        weight: 10,
        skills: [
          { name: "Industry Certifications", weight: 60, requiredLevel: 2, notes: "Relevant professional certifications" },
          { name: "Continuous Learning", weight: 40, requiredLevel: 3, notes: "Evidence of ongoing skill development" }
        ]
      }
    ]
  };
};

// Extract candidate name from resume data
export const extractCandidateName = (resumeData: ResumeData): string | null => {
  return resumeData.name || null;
};

// Evaluate candidate against persona configuration
export const evaluateCandidate = (resumeData: ResumeData, personaConfig: PersonaConfig): CandidateEvaluation => {
  const categoryScores: Array<{ name: string; score: number; details: string; }> = [];
  let weightedTotal = 0;
  let totalWeight = 0;
  
  personaConfig.categories.forEach(category => {
    let categoryScore = 0;
    let categoryWeight = 0;
    const details: string[] = [];
    
    category.skills.forEach(skill => {
      let skillScore = 0;
      
      // Score based on skill type and resume content
      switch (skill.name.toLowerCase()) {
        case 'programming languages':
        case 'technical skills':
          skillScore = Math.min(100, (resumeData.skills.length * 15) + (Math.random() * 25) + 40);
          details.push(`Found ${resumeData.skills.length} technical skills`);
          break;
        case 'framework knowledge':
          const frameworks = resumeData.skills.filter(s => 
            s.toLowerCase().includes('react') || 
            s.toLowerCase().includes('angular') || 
            s.toLowerCase().includes('vue') ||
            s.toLowerCase().includes('express') ||
            s.toLowerCase().includes('spring')
          );
          skillScore = Math.min(100, (frameworks.length * 20) + (Math.random() * 30) + 35);
          details.push(`${frameworks.length} frameworks identified`);
          break;
        case 'years of experience':
        case 'experience':
          skillScore = Math.min(100, (resumeData.experience.length * 20) + (Math.random() * 30) + 30);
          details.push(`${resumeData.experience.length} experience entries found`);
          break;
        case 'certifications':
        case 'industry certifications':
          skillScore = Math.min(100, (resumeData.certifications.length * 25) + (Math.random() * 40) + 20);
          details.push(`${resumeData.certifications.length} certifications listed`);
          break;
        case 'communication':
        case 'written communication':
          // Score based on resume quality and structure
          const textQuality = resumeData.text.length > 500 ? 75 : 55;
          skillScore = textQuality + (Math.random() * 25);
          details.push('Assessed based on resume structure and content quality');
          break;
        case 'leadership experience':
          const leadershipTerms = resumeData.text.toLowerCase();
          const hasLeadership = leadershipTerms.includes('lead') || 
                               leadershipTerms.includes('manager') || 
                               leadershipTerms.includes('senior') ||
                               leadershipTerms.includes('mentor');
          skillScore = hasLeadership ? 75 + (Math.random() * 25) : 45 + (Math.random() * 25);
          details.push(hasLeadership ? 'Leadership experience identified' : 'Limited leadership indicators');
          break;
        default:
          skillScore = 55 + (Math.random() * 35); // Base score with variation
          details.push('General assessment based on overall profile');
      }
      
      categoryScore += skillScore * (skill.weight / 100);
      categoryWeight += skill.weight;
    });
    
    const finalCategoryScore = categoryWeight > 0 ? (categoryScore / categoryWeight) * 100 : 0;
    categoryScores.push({
      name: category.name,
      score: Math.round(finalCategoryScore),
      details: details.join(', ')
    });
    
    weightedTotal += finalCategoryScore * (category.weight / 100);
    totalWeight += category.weight;
  });
  
  const overallScore = Math.round(totalWeight > 0 ? weightedTotal : 0);
  
  // Determine fit category
  let fitCategory: 'perfect' | 'moderate' | 'low';
  if (overallScore >= 85) fitCategory = 'perfect';
  else if (overallScore >= 70) fitCategory = 'moderate';
  else fitCategory = 'low';
  
  // Extract individual scores for compatibility
  const technicalSkills = categoryScores.find(c => c.name.toLowerCase().includes('technical'))?.score || 70;
  const experience = categoryScores.find(c => c.name.toLowerCase().includes('experience'))?.score || 70;
  const communication = categoryScores.find(c => c.name.toLowerCase().includes('communication'))?.score || 70;
  const certifications = categoryScores.find(c => c.name.toLowerCase().includes('certification'))?.score || 60;
  
  return {
    overallScore,
    fitCategory,
    technicalSkills,
    experience,
    communication,
    certifications,
    categoryScores
  };
};
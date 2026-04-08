/**
 * Tool Links — maps professional tools to their official websites
 * and a short description of what they do.
 */

interface ToolInfo {
  url: string;
  description: string;
}

const TOOL_MAP: Record<string, ToolInfo> = {
  // Project management
  'jira': { url: 'https://www.atlassian.com/software/jira', description: 'Project tracking and issue management' },
  'azure devops': { url: 'https://azure.microsoft.com/en-us/products/devops', description: 'Dev planning, repos, and CI/CD' },
  'jira/azure devops': { url: 'https://www.atlassian.com/software/jira', description: 'Project tracking and issue management' },
  'ms project': { url: 'https://www.microsoft.com/en-us/microsoft-365/project/project-management-software', description: 'Project scheduling and Gantt charts' },
  'confluence': { url: 'https://www.atlassian.com/software/confluence', description: 'Team documentation and knowledge base' },
  'trello': { url: 'https://trello.com', description: 'Visual task boards' },
  'asana': { url: 'https://asana.com', description: 'Work management and task tracking' },
  'monday.com': { url: 'https://monday.com', description: 'Work OS for team collaboration' },
  'linear': { url: 'https://linear.app', description: 'Modern issue tracking for software teams' },
  'notion': { url: 'https://www.notion.so', description: 'All-in-one workspace for notes and docs' },

  // Communication
  'slack': { url: 'https://slack.com', description: 'Team messaging and channels' },
  'teams': { url: 'https://www.microsoft.com/en-us/microsoft-teams/group-chat-software', description: 'Video calls, chat, and collaboration' },
  'slack/teams': { url: 'https://slack.com', description: 'Team messaging and collaboration' },
  'microsoft teams': { url: 'https://www.microsoft.com/en-us/microsoft-teams/group-chat-software', description: 'Video calls, chat, and collaboration' },
  'zoom': { url: 'https://zoom.us', description: 'Video conferencing' },

  // Microsoft Office
  'excel': { url: 'https://www.microsoft.com/en-us/microsoft-365/excel', description: 'Spreadsheets, data analysis, formulas' },
  'powerpoint': { url: 'https://www.microsoft.com/en-us/microsoft-365/powerpoint', description: 'Presentations and slide decks' },
  'word': { url: 'https://www.microsoft.com/en-us/microsoft-365/word', description: 'Document creation and editing' },
  'outlook': { url: 'https://www.microsoft.com/en-us/microsoft-365/outlook/email-and-calendar-software-microsoft-outlook', description: 'Email and calendar management' },
  'microsoft 365': { url: 'https://www.microsoft.com/en-us/microsoft-365', description: 'Office suite — Word, Excel, PowerPoint, etc.' },

  // Google
  'google workspace': { url: 'https://workspace.google.com', description: 'Gmail, Docs, Sheets, Drive' },
  'google classroom': { url: 'https://classroom.google.com', description: 'Learning management for schools' },
  'google classroom / teams': { url: 'https://classroom.google.com', description: 'Learning management for schools' },
  'google sheets': { url: 'https://sheets.google.com', description: 'Online spreadsheets' },

  // Development
  'vs code': { url: 'https://code.visualstudio.com', description: 'Code editor used by most developers' },
  'vs code / ide': { url: 'https://code.visualstudio.com', description: 'Code editor used by most developers' },
  'git': { url: 'https://git-scm.com', description: 'Version control for tracking code changes' },
  'git & github': { url: 'https://github.com', description: 'Code hosting and collaboration' },
  'github': { url: 'https://github.com', description: 'Code hosting and collaboration' },
  'docker': { url: 'https://www.docker.com', description: 'Container platform for packaging apps' },
  'docker / containers': { url: 'https://www.docker.com', description: 'Container platform for packaging apps' },
  'kubernetes': { url: 'https://kubernetes.io', description: 'Container orchestration at scale' },

  // Design
  'figma': { url: 'https://www.figma.com', description: 'UI/UX design and prototyping' },
  'figma (design specs)': { url: 'https://www.figma.com', description: 'UI/UX design and prototyping' },
  'canva': { url: 'https://www.canva.com', description: 'Graphic design made simple' },
  'powerpoint / canva': { url: 'https://www.canva.com', description: 'Presentations and graphic design' },
  'adobe creative suite': { url: 'https://www.adobe.com/creativecloud.html', description: 'Photoshop, Illustrator, InDesign, etc.' },

  // Data / Analytics
  'tableau': { url: 'https://www.tableau.com', description: 'Data visualisation and dashboards' },
  'power bi': { url: 'https://powerbi.microsoft.com', description: 'Business intelligence and reporting' },
  'tableau / power bi': { url: 'https://www.tableau.com', description: 'Data visualisation and dashboards' },
  'power bi / tableau': { url: 'https://powerbi.microsoft.com', description: 'Business intelligence dashboards' },
  'python': { url: 'https://www.python.org', description: 'Programming language for data, AI, and automation' },
  'python / jupyter': { url: 'https://jupyter.org', description: 'Interactive coding notebooks for data science' },
  'r': { url: 'https://www.r-project.org', description: 'Statistical programming language' },
  'spss': { url: 'https://www.ibm.com/spss', description: 'Statistical analysis software' },
  'spss / r for research': { url: 'https://www.ibm.com/spss', description: 'Statistical analysis for research' },
  'sql': { url: 'https://www.w3schools.com/sql/', description: 'Database query language' },
  'sql / databases': { url: 'https://www.w3schools.com/sql/', description: 'Database query language' },

  // Cloud
  'aws': { url: 'https://aws.amazon.com', description: 'Amazon cloud computing platform' },
  'azure': { url: 'https://azure.microsoft.com', description: 'Microsoft cloud computing platform' },
  'google cloud': { url: 'https://cloud.google.com', description: 'Google cloud computing platform' },
  'cloud (aws/gcp)': { url: 'https://aws.amazon.com', description: 'Cloud computing platforms' },

  // ML / AI
  'tensorflow': { url: 'https://www.tensorflow.org', description: 'Machine learning framework by Google' },
  'pytorch': { url: 'https://pytorch.org', description: 'Machine learning framework by Meta' },
  'tensorflow / pytorch': { url: 'https://www.tensorflow.org', description: 'Machine learning frameworks' },

  // Accounting / Finance
  'xero': { url: 'https://www.xero.com', description: 'Cloud accounting software' },
  'quickbooks': { url: 'https://quickbooks.intuit.com', description: 'Small business accounting' },
  'xero / quickbooks': { url: 'https://www.xero.com', description: 'Cloud accounting software' },
  'sap': { url: 'https://www.sap.com', description: 'Enterprise resource planning (ERP)' },

  // Engineering / CAD
  'autocad': { url: 'https://www.autodesk.com/products/autocad', description: '2D and 3D design software' },
  'autocad / solidworks': { url: 'https://www.autodesk.com/products/autocad', description: 'Engineering design and CAD' },
  'solidworks': { url: 'https://www.solidworks.com', description: '3D CAD engineering design' },
  'matlab': { url: 'https://www.mathworks.com/products/matlab.html', description: 'Numerical computing and simulation' },
  'matlab / simulink': { url: 'https://www.mathworks.com/products/matlab.html', description: 'Numerical computing and simulation' },

  // Healthcare
  'electronic health records': { url: 'https://www.epic.com', description: 'Digital patient record systems (e.g. Epic, DIPS)' },
  'medical imaging systems': { url: 'https://www.gehealthcare.com', description: 'X-ray, MRI, CT scanning equipment' },

  // CI/CD
  'ci/cd pipelines': { url: 'https://about.gitlab.com/topics/ci-cd/', description: 'Automated build, test, and deploy' },
  'git & notebooks': { url: 'https://github.com', description: 'Code versioning and collaborative notebooks' },

  // Education
  'interactive whiteboard': { url: 'https://www.smarttech.com', description: 'Digital interactive displays for teaching' },
  'learning management system': { url: 'https://moodle.org', description: 'Online course delivery platform (e.g. Moodle, Canvas)' },
  'assessment/grading tools': { url: 'https://www.itslearning.com', description: 'Digital grading and assessment (e.g. itslearning)' },
};

/**
 * Look up a tool's official URL and description.
 * Tries exact match first, then case-insensitive, then partial match.
 */
export function getToolInfo(toolName: string): ToolInfo | null {
  // Exact match
  const lower = toolName.toLowerCase();
  if (TOOL_MAP[lower]) return TOOL_MAP[lower];

  // Partial match — only for keys 4+ chars, on word boundaries, to avoid
  // false positives like the key 'r' matching any tool with the letter "r".
  for (const [key, info] of Object.entries(TOOL_MAP)) {
    if (key.length < 4) continue;
    const wordBoundary = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (wordBoundary.test(lower)) return info;
  }

  return null;
}

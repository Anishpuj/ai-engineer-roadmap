#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROADMAP_FILE = path.join(__dirname, 'roadmap-data.json');
const README_FILE = path.join(__dirname, 'README.md');

// Load roadmap data
function loadRoadmap() {
  try {
    const data = fs.readFileSync(ROADMAP_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading roadmap data:', error.message);
    process.exit(1);
  }
}

// Generate progress bar
function generateProgressBar(percentage) {
  const filled = Math.round(percentage / 5);
  const empty = 20 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Get status icon
function getStatusIcon(status) {
  const icons = {
    'not-started': '⭕',
    'in-progress': '🔄',
    'completed': '✅'
  };
  return icons[status] || '❓';
}

// Get difficulty icon
function getDifficultyIcon(difficulty) {
  const icons = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  };
  return icons[difficulty] || '⚪';
}

// Generate category table
function generateCategoryTable(categories) {
  let table = '| Category | Progress | Topics | Status |\n';
  table += '|----------|----------|--------|---------|\n';
  
  categories.forEach(category => {
    const progress = generateProgressBar(category.progress);
    const completedCount = category.topics.filter(t => t.status === 'completed').length;
    const totalCount = category.topics.length;
    const status = category.progress === 0 ? '⭕ Not Started' : 
                   category.progress === 100 ? '✅ Complete' : '🔄 In Progress';
    
    table += `| ${category.title} | \`${progress}\` ${category.progress}% | ${completedCount}/${totalCount} | ${status} |\n`;
  });
  
  return table;
}

// Generate milestones section
function generateMilestones(milestones) {
  const achieved = milestones.filter(m => m.achieved);
  const upcoming = milestones.filter(m => !m.achieved);
  
  let section = '## 🏆 Achievements & Milestones\n\n';
  
  section += '### ✅ Achieved\n';
  if (achieved.length === 0) {
    section += '*No milestones achieved yet. Keep learning!*\n\n';
  } else {
    achieved.forEach(milestone => {
      section += `- **${milestone.title}** - ${milestone.description} *(${milestone.achievedDate})*\n`;
    });
    section += '\n';
  }
  
  section += '### 🎯 Next Milestones\n';
  if (upcoming.length === 0) {
    section += '*All milestones achieved! 🎉*\n\n';
  } else {
    upcoming.forEach(milestone => {
      section += `- **${milestone.title}** - ${milestone.description}\n`;
    });
    section += '\n';
  }
  
  return section;
}

// Generate learning journey section
function generateLearningJourney(categories) {
  let section = '## 📚 Learning Journey\n\n';
  
  categories.forEach(category => {
    if (category.progress === 0) return; // Skip empty categories
    
    section += `### ${category.title} (${category.progress}% Complete)\n\n`;
    
    const completedTopics = category.topics.filter(t => t.status === 'completed');
    const upcomingTopics = category.topics.filter(t => t.status !== 'completed');
    
    if (completedTopics.length > 0) {
      section += '#### ✅ Completed Topics\n';
      completedTopics.forEach(topic => {
        const stars = '⭐'.repeat(topic.difficulty === 'beginner' ? 3 : topic.difficulty === 'intermediate' ? 4 : 5);
        section += `- **${topic.title}** ${stars}\n`;
        if (topic.project) {
          section += `  - 📁 Project: \`${topic.project}\`\n`;
        }
        if (topic.completedDate) {
          section += `  - ✅ Completed: ${topic.completedDate}\n`;
        }
        section += `  - 📚 Resources: ${topic.resources.join(', ')}\n\n`;
      });
    }
    
    if (upcomingTopics.length > 0) {
      section += '#### 🔄 Upcoming Topics\n';
      upcomingTopics.forEach(topic => {
        const stars = '⭐'.repeat(topic.difficulty === 'beginner' ? 3 : topic.difficulty === 'intermediate' ? 4 : 5);
        section += `- **${topic.title}** ${stars}\n`;
        if (topic.project) {
          section += `  - 📁 Project: \`${topic.project}\`\n`;
        }
        section += `  - ⏱️ Estimated: ${topic.estimatedHours} hours\n`;
        section += `  - 📚 Resources: ${topic.resources.join(', ')}\n\n`;
      });
    }
  });
  
  return section;
}

// Generate statistics section
function generateStatistics(categories, milestones) {
  const totalTopics = categories.reduce((sum, cat) => sum + cat.topics.length, 0);
  const completedTopics = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.status === 'completed').length, 0
  );
  const inProgressTopics = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.status === 'in-progress').length, 0
  );
  const notStartedTopics = totalTopics - completedTopics - inProgressTopics;
  
  const completedHours = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.status === 'completed')
      .reduce((topicSum, topic) => topicSum + (topic.estimatedHours || 0), 0), 0
  );
  const totalHours = categories.reduce((sum, cat) => 
    sum + cat.topics.reduce((topicSum, topic) => topicSum + (topic.estimatedHours || 0), 0), 0
  );
  
  const beginnerTopics = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.difficulty === 'beginner').length, 0
  );
  const intermediateTopics = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.difficulty === 'intermediate').length, 0
  );
  const advancedTopics = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.difficulty === 'advanced').length, 0
  );
  
  const beginnerCompleted = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.difficulty === 'beginner' && t.status === 'completed').length, 0
  );
  const intermediateCompleted = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.difficulty === 'intermediate' && t.status === 'completed').length, 0
  );
  const advancedCompleted = categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.difficulty === 'advanced' && t.status === 'completed').length, 0
  );
  
  let section = '## 📈 Statistics\n\n';
  section += '### Learning Progress\n';
  section += `- **Total Topics**: ${totalTopics}\n`;
  section += `- **Completed**: ${completedTopics} (${Math.round((completedTopics / totalTopics) * 100)}%)\n`;
  section += `- **In Progress**: ${inProgressTopics} (${Math.round((inProgressTopics / totalTopics) * 100)}%)\n`;
  section += `- **Not Started**: ${notStartedTopics} (${Math.round((notStartedTopics / totalTopics) * 100)}%)\n\n`;
  
  section += '### Time Investment\n';
  section += `- **Completed Hours**: ${completedHours} hours\n`;
  section += `- **Estimated Total**: ${totalHours} hours\n`;
  section += `- **Remaining**: ~${totalHours - completedHours} hours\n\n`;
  
  section += '### Difficulty Breakdown\n';
  section += `- 🟢 **Beginner**: ${beginnerTopics} topics (${beginnerCompleted} completed)\n`;
  section += `- 🟡 **Intermediate**: ${intermediateTopics} topics (${intermediateCompleted} completed)\n`;
  section += `- 🔴 **Advanced**: ${advancedTopics} topics (${advancedCompleted} completed)\n\n`;
  
  return section;
}

// Generate topic IDs reference
function generateTopicReference(categories) {
  let section = '### Topic IDs Reference\n';
  
  categories.forEach(category => {
    category.topics.forEach(topic => {
      section += `- \`${topic.id}\` - ${topic.title}\n`;
    });
  });
  
  return section;
}

// Main README generation
function generateReadme() {
  const data = loadRoadmap();
  const roadmap = data.roadmap;
  
  let readme = `# 🤖 AI Engineer Roadmap

> **Comprehensive learning path to become an AI Engineer**  
> Track your progress as you master AI technologies and build real projects

---

## 📊 Overall Progress

\`\`\`
${generateProgressBar(roadmap.overallProgress)} ${roadmap.overallProgress}%
\`\`\`

**🎯 ${roadmap.categories.reduce((sum, cat) => sum + cat.topics.filter(t => t.status === 'completed').length, 0)}/${roadmap.categories.reduce((sum, cat) => sum + cat.topics.length, 0)} topics completed**  
**🏆 ${roadmap.milestones.filter(m => m.achieved).length}/${roadmap.milestones.length} milestones achieved**  
**📅 Last Updated: ${roadmap.lastUpdated}**

---

## 🗺️ Roadmap Overview

${generateCategoryTable(roadmap.categories)}

---

${generateMilestones(roadmap.milestones)}

---

${generateLearningJourney(roadmap.categories)}

---

## 🛠️ Progress Tracking Tools

### Update Your Progress
\`\`\`bash
# Mark a topic as completed
node update-progress.js update topic-id completed

# Mark a topic as in progress
node update-progress.js update topic-id in-progress

# View all topics
node update-progress.js list

# Generate progress report
node update-progress.js report

# View milestones
node update-progress.js milestones
\`\`\`

${generateTopicReference(roadmap.categories)}

---

${generateStatistics(roadmap.categories, roadmap.milestones)}

---

## 🎯 Next Steps

1. **Continue with OpenAI Platform**:
   - Start with **Prompt Engineering** (6 hours)
   - Move to **Embeddings API** (4 hours)

2. **Explore Open Source AI**:
   - Learn **Hugging Face Basics** (3 hours)
   - Try **Ollama for Local Models** (4 hours)

3. **Build Advanced Projects**:
   - Create a **RAG System** with vector databases
   - Develop **AI Agents** with function calling
   - Implement **Multimodal AI** applications

---

## 📂 Project Structure

\`\`\`
Ai-EngineerRoadmap.sh/
├── README.md                    # This file - Dynamic progress overview
├── roadmap-data.json            # Progress data (auto-updated)
├── update-progress.js           # Progress tracking CLI tool
├── generate-readme.js           # README generator (auto-updates)
├── ai-engineer.pdf             # Original roadmap reference
├── projects/                   # Your completed projects
│   ├── ai-chat-application/    # ✅ Chat app with OpenAI
│   ├── prompt-playground/      # 🔄 Prompt engineering experiments
│   ├── semantic-search/        # ⭕ Vector search implementation
│   └── ...
└── resources/                  # Learning resources and notes
    ├── articles/
    ├── videos/
    └── cheatsheets/
\`\`\`

---

## 🚀 Getting Started

1. **Clone this repository** to track your AI Engineer journey
2. **Update progress** as you complete topics using the CLI tool
3. **Build projects** for each topic to solidify your learning
4. **Push to GitHub** to showcase your progress to employers

### Quick Start Commands
\`\`\`bash
# Install dependencies (if needed)
npm install

# Update your first completed topic
node update-progress.js update openai-api-basics completed

# Generate your progress report
node update-progress.js report

# Commit and push to GitHub
git add .
git commit -m "Progress update: Completed OpenAI API basics"
git push origin main
\`\`\`

---

## 🎓 Learning Philosophy

This roadmap follows a **project-based learning approach**:

1. **🎯 Theory First** - Understand concepts through documentation
2. **🛠️ Hands-On Practice** - Build real projects
3. **📊 Track Progress** - Monitor your learning journey
4. **🏆 Celebrate Milestones** - Acknowledge your achievements

### Recommended Learning Flow
1. **Start with fundamentals** - Build strong foundations
2. **Master one platform** - Become expert in OpenAI ecosystem
3. **Explore alternatives** - Learn open source options
4. **Specialize** - Focus on areas that interest you most
5. **Go production** - Deploy real applications

---

## 🤝 Contributing

This is a personal learning tracker, but feel free to:
- **Fork** this roadmap for your own journey
- **Suggest improvements** via issues
- **Share your projects** and learning resources

---

## 📄 License

This roadmap is open for educational purposes. Learn, build, and share! 🚀

---

**🔥 Keep learning, keep building, keep growing!**  
*Last updated: ${new Date().toISOString().split('T')[0]}*`;

  // Write README
  fs.writeFileSync(README_FILE, readme);
  console.log('✅ README.md generated successfully!');
  console.log(`📊 Overall Progress: ${roadmap.overallProgress}%`);
  console.log(`🎯 Topics Completed: ${roadmap.categories.reduce((sum, cat) => sum + cat.topics.filter(t => t.status === 'completed').length, 0)}/${roadmap.categories.reduce((sum, cat) => sum + cat.topics.length, 0)}`);
}

// Auto-update README after progress updates
function autoUpdateReadme() {
  generateReadme();
}

if (require.main === module) {
  generateReadme();
}

module.exports = { generateReadme, autoUpdateReadme };

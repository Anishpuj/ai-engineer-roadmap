#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROADMAP_FILE = path.join(__dirname, 'roadmap-data.json');

// Load current roadmap data
function loadRoadmap() {
  try {
    const data = fs.readFileSync(ROADMAP_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading roadmap data:', error.message);
    process.exit(1);
  }
}

// Save roadmap data
function saveRoadmap(data) {
  try {
    fs.writeFileSync(ROADMAP_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Roadmap updated successfully!');
  } catch (error) {
    console.error('Error saving roadmap data:', error.message);
    process.exit(1);
  }
}

// Calculate progress for a category
function calculateCategoryProgress(category) {
  const totalTopics = category.topics.length;
  const completedTopics = category.topics.filter(topic => 
    topic.status === 'completed'
  ).length;
  return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
}

// Calculate overall progress
function calculateOverallProgress(roadmap) {
  const totalTopics = roadmap.categories.reduce((sum, cat) => sum + cat.topics.length, 0);
  const completedTopics = roadmap.categories.reduce((sum, cat) => 
    sum + cat.topics.filter(topic => topic.status === 'completed').length, 0
  );
  return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
}

// Update topic status
function updateTopicStatus(topicId, status, completedDate = null) {
  const roadmap = loadRoadmap();
  
  // Find and update the topic
  let topicFound = false;
  roadmap.categories.forEach(category => {
    const topic = category.topics.find(t => t.id === topicId);
    if (topic) {
      topic.status = status;
      if (status === 'completed' && !topic.completedDate) {
        topic.completedDate = completedDate || new Date().toISOString().split('T')[0];
      }
      topicFound = true;
      
      // Update category progress
      category.progress = calculateCategoryProgress(category);
    }
  });
  
  if (!topicFound) {
    console.error(`❌ Topic with ID '${topicId}' not found`);
    process.exit(1);
  }
  
  // Update overall progress
  roadmap.overallProgress = calculateOverallProgress(roadmap);
  roadmap.lastUpdated = new Date().toISOString().split('T')[0];
  
  // Check for milestones
  checkMilestones(roadmap);
  
  saveRoadmap(roadmap);
  console.log(`📊 Topic '${topicId}' marked as '${status}'`);
  console.log(`🎯 Overall Progress: ${roadmap.overallProgress}%`);
}

// Check and update milestones
function checkMilestones(roadmap) {
  if (!roadmap.milestones) return;
  
  roadmap.milestones.forEach(milestone => {
    if (milestone.achieved) return;
    
    // Check if all related topics are completed
    const allTopicsCompleted = milestone.relatedTopics.every(topicId => {
      for (const category of roadmap.categories) {
        const topic = category.topics.find(t => t.id === topicId);
        if (topic && topic.status === 'completed') {
          return true;
        }
      }
      return false;
    });
    
    if (allTopicsCompleted) {
      milestone.achieved = true;
      milestone.achievedDate = new Date().toISOString().split('T')[0];
      console.log(`🏆 Milestone Achieved: ${milestone.title}`);
    }
  });
}

// List all topics
function listTopics() {
  const roadmap = loadRoadmap();
  
  console.log('\n🎯 AI Engineer Roadmap - All Topics\n');
  
  roadmap.categories.forEach(category => {
    console.log(`\n${category.title} (${category.progress}% complete)`);
    console.log(`${'='.repeat(50)}`);
    
    category.topics.forEach(topic => {
      const statusIcon = getStatusIcon(topic.status);
      const difficultyIcon = getDifficultyIcon(topic.difficulty);
      console.log(`  ${statusIcon} ${difficultyIcon} ${topic.title}`);
      console.log(`     ${topic.description}`);
      if (topic.project) {
        console.log(`     📁 Project: ${topic.project}`);
      }
      if (topic.completedDate) {
        console.log(`     ✅ Completed: ${topic.completedDate}`);
      }
      console.log('');
    });
  });
}

// Show milestones
function showMilestones() {
  const roadmap = loadRoadmap();
  
  console.log('\n🏆 Milestones\n');
  console.log(`${'='.repeat(50)}`);
  
  roadmap.milestones.forEach(milestone => {
    const statusIcon = milestone.achieved ? '✅' : '🎯';
    const date = milestone.achieved ? milestone.achievedDate : 'Not achieved';
    console.log(`${statusIcon} ${milestone.title}`);
    console.log(`   ${milestone.description}`);
    console.log(`   📅 ${date}\n`);
  });
}

// Generate progress report
function generateReport() {
  const data = loadRoadmap();
  const roadmap = data.roadmap;
  
  console.log('\n📊 Progress Report\n');
  console.log(`${'='.repeat(50)}`);
  console.log(`Overall Progress: ${roadmap.overallProgress}%`);
  console.log(`Last Updated: ${roadmap.lastUpdated}`);
  
  const completedTopics = roadmap.categories.reduce((sum, cat) => 
    sum + cat.topics.filter(t => t.status === 'completed').length, 0
  );
  const totalTopics = roadmap.categories.reduce((sum, cat) => sum + cat.topics.length, 0);
  
  console.log(`Completed Topics: ${completedTopics}/${totalTopics}`);
  
  const achievedMilestones = roadmap.milestones.filter(m => m.achieved).length;
  console.log(`Achieved Milestones: ${achievedMilestones}/${roadmap.milestones.length}`);
  
  // Category breakdown
  console.log('\n📈 Category Progress:');
  roadmap.categories.forEach(category => {
    const progressBar = generateProgressBar(category.progress);
    console.log(`${category.title}: ${progressBar} ${category.progress}%`);
  });
}

// Helper functions
function getStatusIcon(status) {
  const icons = {
    'not-started': '⭕',
    'in-progress': '🔄',
    'completed': '✅'
  };
  return icons[status] || '❓';
}

function getDifficultyIcon(difficulty) {
  const icons = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  };
  return icons[difficulty] || '⚪';
}

function generateProgressBar(percentage) {
  const filled = Math.round(percentage / 5);
  const empty = 20 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'update':
      if (args.length < 3) {
        console.log('Usage: node update-progress.js update <topic-id> <status> [date]');
        console.log('Status: not-started, in-progress, completed');
        process.exit(1);
      }
      updateTopicStatus(args[1], args[2], args[3]);
      break;
      
    case 'list':
      listTopics();
      break;
      
    case 'milestones':
      showMilestones();
      break;
      
    case 'report':
      generateReport();
      break;
      
    default:
      console.log('AI Engineer Roadmap Progress Tracker');
      console.log('\nCommands:');
      console.log('  update <topic-id> <status> [date]  - Update topic status');
      console.log('  list                              - List all topics');
      console.log('  milestones                         - Show milestones');
      console.log('  report                            - Generate progress report');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadRoadmap,
  saveRoadmap,
  updateTopicStatus,
  generateReport
};

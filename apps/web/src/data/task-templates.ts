export interface TaskTemplate {
  id: string
  title: string
  description?: string
  category: 'work' | 'personal' | 'health' | 'learning' | 'home'
  priority: 1 | 2 | 3
  estimatedDuration?: string // e.g., "30 minutes", "2 hours", "1 day"
  suggestedTags: string[]
  dueInDays?: number // Default days to add to current date for due date
}

export const taskTemplates: TaskTemplate[] = [
  // Work Templates
  {
    id: 'work-daily-standup',
    title: 'Attend daily standup meeting',
    description: 'Share progress, blockers, and plan for today',
    category: 'work',
    priority: 2,
    estimatedDuration: '15 minutes',
    suggestedTags: ['meeting', 'daily'],
    dueInDays: 0, // Today
  },
  {
    id: 'work-code-review',
    title: 'Review pull requests',
    description: 'Review and provide feedback on pending pull requests',
    category: 'work',
    priority: 2,
    estimatedDuration: '1 hour',
    suggestedTags: ['code-review', 'development'],
    dueInDays: 1,
  },
  {
    id: 'work-project-planning',
    title: 'Plan next sprint tasks',
    description: 'Break down user stories and estimate effort',
    category: 'work',
    priority: 1,
    estimatedDuration: '2 hours',
    suggestedTags: ['planning', 'sprint'],
    dueInDays: 7,
  },
  {
    id: 'work-client-meeting',
    title: 'Prepare for client presentation',
    description: 'Create slides and demo for client meeting',
    category: 'work',
    priority: 1,
    estimatedDuration: '3 hours',
    suggestedTags: ['presentation', 'client'],
    dueInDays: 3,
  },
  {
    id: 'work-weekly-report',
    title: 'Submit weekly progress report',
    description: 'Summarize achievements, challenges, and next week plans',
    category: 'work',
    priority: 2,
    estimatedDuration: '30 minutes',
    suggestedTags: ['report', 'weekly'],
    dueInDays: 7,
  },

  // Personal Templates
  {
    id: 'personal-exercise',
    title: 'Exercise workout',
    description: 'Complete daily exercise routine',
    category: 'health',
    priority: 2,
    estimatedDuration: '45 minutes',
    suggestedTags: ['exercise', 'health'],
    dueInDays: 0,
  },
  {
    id: 'personal-read-book',
    title: 'Read book for 30 minutes',
    description: 'Continue reading current book',
    category: 'learning',
    priority: 3,
    estimatedDuration: '30 minutes',
    suggestedTags: ['reading', 'learning'],
    dueInDays: 0,
  },
  {
    id: 'personal-meal-prep',
    title: 'Prepare meals for the week',
    description: 'Plan and prepare healthy meals for the upcoming week',
    category: 'personal',
    priority: 2,
    estimatedDuration: '2 hours',
    suggestedTags: ['meal-prep', 'health'],
    dueInDays: 1,
  },
  {
    id: 'personal-budget-review',
    title: 'Review monthly budget and expenses',
    description: 'Check spending, update budget, plan for next month',
    category: 'personal',
    priority: 2,
    estimatedDuration: '1 hour',
    suggestedTags: ['finance', 'monthly'],
    dueInDays: 30,
  },

  // Home Templates
  {
    id: 'home-cleaning',
    title: 'Weekly house cleaning',
    description: 'Clean and organize living spaces',
    category: 'home',
    priority: 2,
    estimatedDuration: '2 hours',
    suggestedTags: ['cleaning', 'weekly'],
    dueInDays: 7,
  },
  {
    id: 'home-laundry',
    title: 'Do laundry',
    description: 'Wash, dry, and fold clothes',
    category: 'home',
    priority: 3,
    estimatedDuration: '3 hours',
    suggestedTags: ['laundry', 'chores'],
    dueInDays: 2,
  },
  {
    id: 'home-grocery',
    title: 'Grocery shopping',
    description: 'Buy groceries for the week',
    category: 'home',
    priority: 2,
    estimatedDuration: '1 hour',
    suggestedTags: ['shopping', 'groceries'],
    dueInDays: 3,
  },

  // Learning Templates
  {
    id: 'learning-course',
    title: 'Complete online course module',
    description: 'Watch videos and complete exercises',
    category: 'learning',
    priority: 2,
    estimatedDuration: '1 hour',
    suggestedTags: ['course', 'learning'],
    dueInDays: 1,
  },
  {
    id: 'learning-practice',
    title: 'Practice coding skills',
    description: 'Solve coding problems or work on personal project',
    category: 'learning',
    priority: 2,
    estimatedDuration: '1 hour',
    suggestedTags: ['coding', 'practice'],
    dueInDays: 0,
  },
  {
    id: 'learning-article',
    title: 'Read tech articles',
    description: 'Stay updated with latest technology trends',
    category: 'learning',
    priority: 3,
    estimatedDuration: '30 minutes',
    suggestedTags: ['reading', 'tech'],
    dueInDays: 0,
  },

  // Health Templates
  {
    id: 'health-doctor',
    title: 'Schedule doctor appointment',
    description: 'Book routine health checkup',
    category: 'health',
    priority: 2,
    estimatedDuration: '15 minutes',
    suggestedTags: ['health', 'appointment'],
    dueInDays: 7,
  },
  {
    id: 'health-meditation',
    title: 'Meditation practice',
    description: '10-minute mindfulness meditation',
    category: 'health',
    priority: 3,
    estimatedDuration: '10 minutes',
    suggestedTags: ['meditation', 'mindfulness'],
    dueInDays: 0,
  },
  {
    id: 'health-water',
    title: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    category: 'health',
    priority: 3,
    estimatedDuration: 'All day',
    suggestedTags: ['hydration', 'health'],
    dueInDays: 0,
  },
]

// Get templates by category
export const getTemplatesByCategory = (category: TaskTemplate['category']) => {
  return taskTemplates.filter(template => template.category === category)
}

// Get all categories
export const getTemplateCategories = () => {
  return Array.from(new Set(taskTemplates.map(template => template.category)))
}

// Quick access to common daily/weekly templates
export const getDailyTemplates = () => {
  return taskTemplates.filter(template => template.dueInDays === 0)
}

export const getWeeklyTemplates = () => {
  return taskTemplates.filter(template => template.dueInDays === 7)
}

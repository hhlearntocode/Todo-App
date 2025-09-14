import { PrismaClient } from '@prisma/client';
import { addDays, subDays, addHours } from 'date-fns';

const prisma = new PrismaClient();

const sampleTasks = [
  {
    title: "Complete project proposal",
    description: "Write and submit the quarterly project proposal to management",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 2),
    tags: ["work", "urgent"]
  },
  {
    title: "Buy groceries",
    description: "Get milk, bread, eggs, and vegetables for the week",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 1),
    tags: ["home", "shopping"]
  },
  {
    title: "Review React documentation",
    description: "Study the latest React 18 features and concurrent rendering",
    priority: 2,
    completed: true,
    dueDate: subDays(new Date(), 1),
    tags: ["study", "development"]
  },
  {
    title: "Schedule dentist appointment",
    description: "Book an appointment for teeth cleaning",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 7),
    tags: ["health", "personal"]
  },
  {
    title: "Prepare presentation slides",
    description: "Create slides for the monthly team meeting",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 3),
    tags: ["work", "presentation"]
  },
  {
    title: "Update portfolio website",
    description: "Add recent projects and update skills section",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 10),
    tags: ["personal", "development"]
  },
  {
    title: "Learn TypeScript advanced features",
    description: "Deep dive into conditional types and template literals",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 14),
    tags: ["study", "development"]
  },
  {
    title: "Clean the garage",
    description: "Organize tools and dispose of unused items",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 5),
    tags: ["home", "cleaning"]
  },
  {
    title: "Plan vacation itinerary",
    description: "Research and book activities for summer vacation",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 21),
    tags: ["personal", "travel"]
  },
  {
    title: "Fix leaky faucet",
    description: "Replace washers in the kitchen sink faucet",
    priority: 1,
    completed: true,
    dueDate: subDays(new Date(), 3),
    tags: ["home", "maintenance"]
  },
  {
    title: "Submit expense reports",
    description: "Compile and submit Q3 expense reports to accounting",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 1),
    tags: ["work", "finance"]
  },
  {
    title: "Call Mom",
    description: "Check in with Mom and see how she's doing",
    priority: 2,
    completed: true,
    dueDate: new Date(),
    tags: ["family", "personal"]
  },
  {
    title: "Update team wiki",
    description: "Add documentation for the new API endpoints",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 7),
    tags: ["work", "documentation"]
  },
  {
    title: "Exercise routine",
    description: "Go to the gym and complete cardio + strength training",
    priority: 2,
    completed: false,
    dueDate: new Date(),
    tags: ["health", "fitness"]
  },
  {
    title: "Read 'Clean Code' book",
    description: "Continue reading chapter 5 about formatting",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 30),
    tags: ["study", "development"]
  },
  {
    title: "Backup computer files",
    description: "Create backup of important documents and photos",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 3),
    tags: ["personal", "maintenance"]
  },
  {
    title: "Research new laptop",
    description: "Compare specs and prices for development laptop upgrade",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 15),
    tags: ["shopping", "development"]
  },
  {
    title: "Attend team standup",
    description: "Daily standup meeting with the development team",
    priority: 1,
    completed: true,
    dueDate: subDays(new Date(), 1),
    tags: ["work", "meeting"]
  },
  {
    title: "Write blog post",
    description: "Article about React performance optimization techniques",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 12),
    tags: ["writing", "development"]
  },
  {
    title: "Organize closet",
    description: "Sort clothes and donate items not worn in a year",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 8),
    tags: ["home", "organization"]
  },
  {
    title: "Setup CI/CD pipeline",
    description: "Configure automated testing and deployment for the project",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 5),
    tags: ["work", "devops"]
  },
  {
    title: "Practice guitar",
    description: "Learn the new song from sheet music",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 7),
    tags: ["hobby", "music"]
  },
  {
    title: "Review code pull requests",
    description: "Review and provide feedback on team's pull requests",
    priority: 1,
    completed: true,
    dueDate: subDays(new Date(), 2),
    tags: ["work", "review"]
  },
  {
    title: "Plan weekend trip",
    description: "Research destinations and book accommodation",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 4),
    tags: ["personal", "travel"]
  },
  {
    title: "Update dependencies",
    description: "Upgrade npm packages to latest stable versions",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 6),
    tags: ["work", "maintenance"]
  },
  {
    title: "Cook dinner for friends",
    description: "Prepare Italian pasta dinner for weekend gathering",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 3),
    tags: ["social", "cooking"]
  },
  {
    title: "Review investment portfolio",
    description: "Check performance and rebalance if needed",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 10),
    tags: ["finance", "personal"]
  },
  {
    title: "Water the plants",
    description: "Water all indoor and outdoor plants",
    priority: 3,
    completed: true,
    dueDate: subDays(new Date(), 1),
    tags: ["home", "gardening"]
  },
  {
    title: "Setup monitoring alerts",
    description: "Configure application monitoring and alerting system",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 4),
    tags: ["work", "monitoring"]
  },
  {
    title: "Learn Docker compose",
    description: "Study multi-container application orchestration",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 14),
    tags: ["study", "devops"]
  },
  {
    title: "Schedule car maintenance",
    description: "Book appointment for oil change and tire rotation",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 7),
    tags: ["personal", "maintenance"]
  },
  {
    title: "Write unit tests",
    description: "Add test coverage for user authentication module",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 3),
    tags: ["work", "testing"]
  },
  {
    title: "Research vacation destinations",
    description: "Compare prices and activities for summer holiday",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 20),
    tags: ["personal", "travel"]
  },
  {
    title: "Optimize database queries",
    description: "Analyze and improve slow database operations",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 5),
    tags: ["work", "performance"]
  },
  {
    title: "Buy birthday gift",
    description: "Find a perfect gift for Sarah's birthday next week",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 6),
    tags: ["personal", "shopping"]
  },
  {
    title: "Setup development environment",
    description: "Configure new laptop with development tools",
    priority: 1,
    completed: true,
    dueDate: subDays(new Date(), 5),
    tags: ["development", "setup"]
  },
  {
    title: "Practice meditation",
    description: "20-minute mindfulness meditation session",
    priority: 3,
    completed: false,
    dueDate: new Date(),
    tags: ["health", "mindfulness"]
  },
  {
    title: "Update resume",
    description: "Add recent projects and skills to resume",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 30),
    tags: ["career", "personal"]
  },
  {
    title: "Security audit",
    description: "Review application for security vulnerabilities",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 7),
    tags: ["work", "security"]
  },
  {
    title: "Plan team building event",
    description: "Organize quarterly team building activity",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 14),
    tags: ["work", "management"]
  },
  {
    title: "Learn GraphQL",
    description: "Study GraphQL fundamentals and best practices",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 21),
    tags: ["study", "development"]
  },
  {
    title: "Clean email inbox",
    description: "Organize and delete old emails, unsubscribe from lists",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 2),
    tags: ["personal", "organization"]
  },
  {
    title: "Setup backup strategy",
    description: "Implement automated backup solution for project files",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 8),
    tags: ["work", "backup"]
  },
  {
    title: "Attend conference",
    description: "Participate in React conference and take notes",
    priority: 2,
    completed: true,
    dueDate: subDays(new Date(), 7),
    tags: ["study", "conference"]
  },
  {
    title: "Fix responsive design issues",
    description: "Resolve mobile layout problems on product page",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 2),
    tags: ["work", "frontend"]
  },
  {
    title: "Meal prep for the week",
    description: "Prepare healthy meals for Monday through Friday",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 1),
    tags: ["health", "cooking"]
  },
  {
    title: "Review team performance",
    description: "Conduct quarterly performance reviews for team members",
    priority: 1,
    completed: false,
    dueDate: addDays(new Date(), 10),
    tags: ["work", "management"]
  },
  {
    title: "Study AWS services",
    description: "Learn about Lambda, S3, and RDS for cloud migration",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 18),
    tags: ["study", "cloud"]
  },
  {
    title: "Install smart thermostat",
    description: "Replace old thermostat with programmable smart unit",
    priority: 3,
    completed: false,
    dueDate: addDays(new Date(), 12),
    tags: ["home", "upgrade"]
  },
  {
    title: "Write technical documentation",
    description: "Document API endpoints and usage examples",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 8),
    tags: ["work", "documentation"]
  },
  {
    title: "Plan monthly budget",
    description: "Review expenses and set budget for next month",
    priority: 2,
    completed: false,
    dueDate: addDays(new Date(), 5),
    tags: ["finance", "personal"]
  }
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create tags first
  const allTags = Array.from(new Set(sampleTasks.flatMap(task => task.tags)));
  const tagColors = [
    'red', 'orange', 'amber', 'yellow', 'lime', 'green', 
    'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 
    'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate'
  ];

  const createdTags = await Promise.all(
    allTags.map((tagName, index) =>
      prisma.tag.create({
        data: {
          name: tagName,
          color: tagColors[index % tagColors.length]
        }
      })
    )
  );

  console.log(`✅ Created ${createdTags.length} tags`);

  // Create tasks with tags
  for (let i = 0; i < sampleTasks.length; i++) {
    const task = sampleTasks[i];
    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: task.completed,
        dueDate: task.dueDate,
        orderIndex: i,
        tags: {
          create: task.tags.map(tagName => ({
            tag: {
              connect: {
                name: tagName
              }
            }
          }))
        }
      }
    });
  }

  console.log(`✅ Created ${sampleTasks.length} tasks`);

  // Print statistics
  const taskCount = await prisma.task.count();
  const tagCount = await prisma.tag.count();
  const completedCount = await prisma.task.count({ where: { completed: true } });
  const urgentCount = await prisma.task.count({ where: { priority: 1 } });

  console.log('\n📊 Seed Summary:');
  console.log(`   Total tasks: ${taskCount}`);
  console.log(`   Completed tasks: ${completedCount}`);
  console.log(`   Urgent tasks (Priority 1): ${urgentCount}`);
  console.log(`   Total tags: ${tagCount}`);
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

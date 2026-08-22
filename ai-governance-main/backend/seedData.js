import mongoose from 'mongoose';
import Template from './models/Template.js';
import connectDB from './config.js';

const templates = [
  {
    name: 'AI System Assessment',
    description: 'Internal assessment for AI systems and models.',
    templateType: 'AI System',
    questions: [
      {
        questionText: 'How will you explain how the AI makes decisions to the people using it?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 1
      },
      {
        questionText: 'What are you doing to make sure the AI is fair and doesn\'t discriminate against anyone?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: 'How will you check that the AI is still working correctly and accurately after it\'s launched?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 3
      }
    ]
  },
  {
    name: 'Cybersecurity Management Assessment',
    description: 'Internal assessment for cybersecurity management systems.',
    templateType: 'Cybersecurity Management System',
    questions: [
      {
        questionText: 'How do you regularly check who has access to the system and what they can do?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 1
      },
      {
        questionText: 'What is your plan if there\'s a security problem or someone tries to hack the system?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: 'How often do you test the system for security weaknesses or holes?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 3
      }
    ]
  },
  {
    name: 'Third-party AI Assessment',
    description: 'Assessment for third-party AI system integration.',
    templateType: 'Third-party AI System',
    questions: [
      {
        questionText: 'Has the third-party provider shared their model transparency reports or AI ethics guidelines?',
        responseType: 'boolean',
        isRequired: true,
        questionOrder: 1
      },
      {
        questionText: 'What data privacy and security guarantees does the provider offer for data processed by their AI?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: 'Are there clear service level agreements (SLAs) regarding model uptime and performance?',
        responseType: 'boolean',
        isRequired: true,
        questionOrder: 3
      }
    ]
  },
  {
    name: 'Third-party Cybersecurity Assessment',
    description: 'Assessment for third-party cybersecurity services.',
    templateType: 'Third-party Cybersecurity System',
    questions: [
      {
        questionText: 'Does the provider maintain recognized security certifications (e.g., ISO 27001, SOC 2)?',
        responseType: 'boolean',
        isRequired: true,
        questionOrder: 1
      },
      {
        questionText: 'How does the provider notify partners of security breaches affecting their infrastructure?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: 'What is the provider\'s policy for data retention and disposal after contract termination?',
        responseType: 'text',
        isRequired: true,
        questionOrder: 3
      }
    ]
  }
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Insert new templates
    await Template.insertMany(templates);
    console.log('Seeded templates successfully');
    
    // If running as a standalone script, close the connection
    if (import.meta.url === `file://${process.argv[1]}`) {
        mongoose.connection.close();
    }
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
};

export default seedData;

// Run if called directly
if (process.argv[1].endsWith('seedData.js')) {
  seedData();
}

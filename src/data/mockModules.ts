import { Module } from '../types/content';

export const mockModules: Module[] = [
  {
    id: '1',
    title: 'Company Introduction',
    description: 'Learn about BBRC\'s history, values, and mission',
    type: 'video',
    duration: 30,
    requiredRoles: ['staff', 'ned'],
    sections: [
      {
        id: 'intro-1',
        title: 'Welcome to BBRC',
        content: `Welcome to BBRC! We're excited to have you join our team.

This module will introduce you to our company's rich history, core values, and mission that drives everything we do.

Our journey began in 1985 with a vision to revolutionize the industry through innovation and excellence. Today, we're proud to be a leading force in our sector, serving customers across the globe.`,
        videoUrl: 'https://vimeo.com/123456789'
      },
      {
        id: 'intro-2',
        title: 'Our Values',
        content: `At BBRC, our values are the foundation of everything we do:

1. Innovation First
2. Customer Success
3. Integrity Always
4. Sustainable Growth
5. Team Excellence

These values guide our decisions and shape our culture.`,
      },
      {
        id: 'intro-3',
        title: 'Our Mission',
        content: `Our mission is to deliver exceptional value to our stakeholders through innovative solutions and sustainable practices.

We achieve this by:
- Investing in cutting-edge technology
- Developing our people
- Maintaining the highest standards of corporate governance
- Contributing to our communities`,
        videoUrl: 'https://vimeo.com/123456790'
      }
    ]
  },
  // ... rest of the modules remain unchanged
];
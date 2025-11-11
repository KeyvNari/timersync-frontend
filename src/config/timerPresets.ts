export interface TimerPreset {
  duration: number; // in seconds
  slug: string; // URL-friendly path
  title: string; // SEO title
  description: string; // Meta description
  content: string; // Unique page content
  keywords: string[]; // Target keywords
  uses: string[]; // Use cases
}

export const timerPresets: TimerPreset[] = [
  {
    duration: 300,
    slug: '5-minute-timer',
    title: 'Free 5 Minute Timer Online - Quick Countdown',
    description: 'Fast and reliable 5 minute countdown timer. Perfect for quick breaks, exercises, or time management. Start instantly with one click.',
    content: `A simple 5 minute timer for when you need a quick burst of productivity. Whether you're taking a quick stretch break, doing a short workout session, or timing a rapid task, this timer gets the job done. The clean, distraction-free interface keeps you focused on what matters.`,
    keywords: ['5 minute timer', '5 min timer', 'quick timer', 'online timer'],
    uses: ['Quick breaks', 'Short workouts', 'Exercise intervals', 'Rapid tasks', 'Mindfulness breaks'],
  },
  {
    duration: 600,
    slug: '10-minute-timer',
    title: 'Free 10 Minute Timer Online - Productive & Easy',
    description: 'A simple 10 minute countdown timer for studying, breaks, or meetings. No ads, no complexity. Just a clean timer that works.',
    content: `The 10 minute timer is perfect for focused work sessions, study breaks, or quick meetings. Use it for the Pomodoro technique, exercise intervals, or any task that needs exactly 10 minutes. Our timer is designed for clarity and ease of use—no distractions, just time.`,
    keywords: ['10 minute timer', '10 min timer', 'online timer', 'countdown timer', 'pomodoro timer'],
    uses: ['Study sessions', 'Work breaks', 'Exercise sets', 'Cooking', 'Quick meetings'],
  },
  {
    duration: 900,
    slug: '15-minute-timer',
    title: 'Free 15 Minute Timer - Perfect for Focused Work',
    description: 'Reliable 15 minute timer for productive work blocks, meditation, or fitness routines. Clean, simple, and completely free.',
    content: `Take advantage of a focused 15 minute work block with our precision timer. This duration is ideal for meditation sessions, workout circuits, short presentations, or focused study periods. Set it and forget it—our timer handles the counting while you focus on the task at hand.`,
    keywords: ['15 minute timer', '15 min timer', 'work timer', 'meditation timer', 'fitness timer'],
    uses: ['Meditation', 'Focused work', 'Workout circuits', 'Presentations', 'Study blocks'],
  },
  {
    duration: 1200,
    slug: '20-minute-timer',
    title: 'Free 20 Minute Timer - Focus & Productivity',
    description: 'Clean 20 minute countdown timer for deep work sessions, meetings, or training. Start your focused work session now.',
    content: `The 20 minute timer strikes the perfect balance between quick tasks and deep focus. It's the ideal duration for intensive study sessions, creative work blocks, team meetings, or workout routines. Our simple, distraction-free design helps you stay on track.`,
    keywords: ['20 minute timer', '20 min timer', 'focus timer', 'work timer', 'meeting timer'],
    uses: ['Deep work sessions', 'Study blocks', 'Meetings', 'Training sessions', 'Creative work'],
  },
  {
    duration: 1500,
    slug: '25-minute-timer',
    title: 'Free 25 Minute Timer - The Pomodoro Standard',
    description: 'Classic 25 minute Pomodoro timer for productivity and focus. Perfect for work sprints, studying, or project management.',
    content: `The 25 minute timer is the original Pomodoro interval—trusted by millions for managing attention and maximizing productivity. Whether you're tackling a project, studying for exams, or diving into creative work, this timer helps you work in focused bursts with built-in breaks.`,
    keywords: ['25 minute timer', 'pomodoro timer', 'productivity timer', 'focus timer', 'work timer'],
    uses: ['Pomodoro technique', 'Project work', 'Exam preparation', 'Creative projects', 'Professional tasks'],
  },
  {
    duration: 1800,
    slug: '30-minute-timer',
    title: 'Free 30 Minute Timer - Extended Focus Sessions',
    description: 'Reliable 30 minute timer for longer work sessions, training, or meditation. Free, simple, and effective.',
    content: `Give yourself 30 minutes of uninterrupted time with our precision timer. This duration is perfect for longer study sessions, extended workout routines, meditation practices, cooking, or comprehensive work blocks. Our clean interface keeps you focused on what you're doing.`,
    keywords: ['30 minute timer', '30 min timer', 'workout timer', 'study timer', 'meditation timer'],
    uses: ['Extended work sessions', 'Workouts', 'Meditation', 'Cooking', 'Training routines'],
  },
  {
    duration: 2700,
    slug: '45-minute-timer',
    title: 'Free 45 Minute Timer - Long Focus Sessions',
    description: '45 minute countdown timer perfect for comprehensive work sessions, classes, or extended activities. Clean and reliable.',
    content: `The 45 minute timer is ideal for longer work sessions, class periods, intensive training, or substantial projects. This extended duration gives you enough time to achieve deep focus and meaningful progress. Perfect for academics, professionals, and anyone committed to sustained effort.`,
    keywords: ['45 minute timer', '45 min timer', 'class timer', 'work timer', 'training timer'],
    uses: ['Classes or lectures', 'Long work sessions', 'Intensive training', 'Project work', 'Comprehensive tasks'],
  },
  {
    duration: 3600,
    slug: '60-minute-timer',
    title: 'Free 60 Minute Timer (1 Hour) - Full Focus Block',
    description: '1 hour countdown timer for full work sessions, meetings, or substantial projects. Precise and distraction-free.',
    content: `A full hour of focused time with our reliable 60 minute timer. This extended duration is perfect for comprehensive meetings, major project phases, extended study sessions, or professional work blocks. Use it for webinars, presentations, or any task requiring sustained attention.`,
    keywords: ['60 minute timer', '1 hour timer', '1hr timer', 'meeting timer', 'work timer'],
    uses: ['Meetings', 'Webinars', 'Major project phases', 'Study marathons', 'Professional work'],
  },
];

/**
 * Get a timer preset by slug
 */
export const getTimerPreset = (slug: string): TimerPreset | undefined => {
  return timerPresets.find((preset) => preset.slug === slug);
};

/**
 * Get all available slugs
 */
export const getTimerSlugs = (): string[] => {
  return timerPresets.map((preset) => preset.slug);
};

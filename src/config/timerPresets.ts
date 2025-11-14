export interface TimerPreset {
  duration: number; // in seconds
  slug: string; // URL-friendly path
  title: string; // SEO title (50-60 chars)
  description: string; // Meta description (150-160 chars)
  content: string; // Main page content (800+ words)
  keywords: string[]; // Target keywords (8-15)
  uses: string[]; // Use cases (5-7 items)
  category: 'productivity' | 'fitness' | 'learning' | 'wellness' | 'lifestyle';
  whySection: string; // Why this duration (200-300 words)
  howToSection: string; // How to use (300-400 words)
  tipsSection: string[]; // 5-7 tips/best practices
  faqSection: Array<{ question: string; answer: string }>; // 3-5 FAQs
  relatedTimers: string[]; // Related timer slugs for internal linking
}

export const timerPresets: TimerPreset[] = [
  {
    duration: 300,
    slug: '5-minute-timer',
    title: 'Free 5 Minute Timer Online - Quick Countdown',
    description: 'Fast and reliable 5 minute countdown timer. Perfect for quick breaks, exercises, or time management. Start instantly with one click.',
    content: `A simple 5 minute timer for when you need a quick burst of productivity. Whether you're taking a quick stretch break, doing a short workout session, or timing a rapid task, this timer gets the job done. The clean, distraction-free interface keeps you focused on what matters. The 5 minute interval is scientifically proven to be ideal for micro-breaks, which help restore mental focus and prevent fatigue. Use it throughout your day for optimal productivity and wellbeing.`,
    keywords: ['5 minute timer', '5 min timer', 'quick timer', 'online timer', 'microbreak timer', 'fast timer', 'quick countdown timer'],
    uses: ['Quick breaks', 'Short workouts', 'Exercise intervals', 'Rapid tasks', 'Mindfulness breaks'],
    category: 'productivity',
    whySection: `The 5-minute timer is perfect for quick bursts of activity and recovery breaks. Research shows that taking regular short breaks throughout the day significantly improves focus and productivity. A 5-minute break is long enough to stretch, hydrate, or step outside, but short enough that you won't lose momentum on your main task. This duration aligns with microbreak science, which suggests that breaks of 5-10 minutes every 30-60 minutes of work can restore mental resources and prevent burnout. Whether you're in a busy workday or managing exercise intervals, the 5-minute mark offers the ideal balance between task focus and recovery time.`,
    howToSection: `Using the 5-minute timer is straightforward. Simply load the timer on your device and click "Start" when you're ready to begin your break or activity. The timer will count down with clear visibility of the remaining time. The alarm will sound when time is up, letting you know it's time to transition to your next activity. For optimal results, use it consistently throughout your day—set it for micro-breaks during work sessions, exercise intervals during training, or meditation pauses during mindfulness practice. You can pause and resume as needed, making it flexible for your schedule.`,
    tipsSection: [
      'Use the 5-minute timer to take regular breaks every hour to maintain peak focus and productivity',
      'During exercise, use it for quick 5-minute warm-up or cool-down sessions',
      'Perfect for rapid task completion—set it when you need to focus on one small item',
      'Use it for timed breathing exercises or quick meditation sessions',
      'Great for keeping eye breaks frequent when working on screens for extended periods',
      'Use multiple consecutive timers for interval training or circuit exercises',
      'Set a repeating 5-minute break schedule to remind you to stand up and stretch',
    ],
    faqSection: [
      {
        question: 'How often should I use the 5-minute timer for breaks?',
        answer: 'Research suggests taking a 5-minute break every 30-60 minutes of focused work. This helps maintain mental sharpness and prevents burnout. Some prefer the Pomodoro method with different intervals, but 5-minute breaks are effective for quick recovery.',
      },
      {
        question: 'Is 5 minutes enough time for an effective exercise break?',
        answer: 'Yes! A 5-minute movement break can be very effective. You can do stretching exercises, a quick walk, or light bodyweight exercises. These micro-workouts improve blood circulation and reduce stiffness from sitting.',
      },
      {
        question: 'Can I use the 5-minute timer for meditation?',
        answer: 'Absolutely. 5 minutes is an excellent duration for beginners starting a meditation practice. It\'s enough time to establish focus and experience benefits without being overwhelming.',
      },
      {
        question: 'What alarms does the VeroTime 5-minute timer have?',
        answer: 'VeroTime features a pleasant, non-intrusive alarm sound that notifies you when the 5 minutes are complete. The visual display also shows "Time\'s Up" clearly.',
      },
      {
        question: 'Can I pause the timer in the middle?',
        answer: 'Yes, the timer includes pause and resume functionality. You can pause at any point and continue later, though for best results with breaks, we recommend letting it run uninterrupted.',
      },
    ],
    relatedTimers: ['10-minute-timer', '15-minute-timer', '25-minute-timer', '30-minute-timer'],
  },
  {
    duration: 600,
    slug: '10-minute-timer',
    title: 'Free 10 Minute Timer Online - Productive & Easy',
    description: 'A simple 10 minute countdown timer for studying, breaks, or meetings. No ads, no complexity. Just a clean timer that works.',
    content: `The 10 minute timer is perfect for focused work sessions, study breaks, or quick meetings. Use it for the Pomodoro technique, exercise intervals, or any task that needs exactly 10 minutes. Our timer is designed for clarity and ease of use—no distractions, just time. Whether you're a student preparing for class, a professional timing a meeting, or an athlete managing workout intervals, the 10-minute duration strikes the perfect balance between focus and completion. This versatile timer is ideal for time-blocking smaller tasks or as a break interval during longer work sessions.`,
    keywords: ['10 minute timer', '10 min timer', 'online timer', 'countdown timer', 'Pomodoro timer', 'study timer', 'work break timer'],
    uses: ['Study sessions', 'Work breaks', 'Exercise sets', 'Cooking', 'Quick meetings'],
    category: 'productivity',
    whySection: `The 10-minute timer is an ideal interval for many activities. It's long enough to accomplish meaningful work or exercise, yet short enough to maintain focus without fatigue. In the Pomodoro Technique framework, a 10-minute timer works well as an extended break between 25-minute work sessions, giving you enough time to recover while maintaining momentum. For exercise, 10 minutes allows for a complete warm-up, workout circuit, or cool-down session. Students find it perfect for timed practice problems or focused review sessions. The 10-minute mark represents a cognitive sweet spot where most people can maintain peak attention and engagement before mental fatigue sets in.`,
    howToSection: `Start the 10-minute timer by clicking the "Start" button on our timer interface. The countdown will display clearly in large numbers, making it easy to see remaining time at a glance. You can pause the timer at any point if you need to adjust your activity, and resume when ready. For study sessions, use it to focus on a single subject or problem type. For exercise, use it for a complete workout circuit including warm-up and cool-down. For meetings, it keeps discussions on track and ensures time management. The timer will alert you with a sound when the 10 minutes are complete, and you can immediately start another cycle or reset for a different activity.`,
    tipsSection: [
      'Use the 10-minute timer for focused study blocks—remove distractions before starting',
      'Perfect for timing workout circuits with 1 minute per exercise across 10 different movements',
      'Set it as a meeting timer to keep discussions structured and on schedule',
      'Use two back-to-back 10-minute timers (20 minutes) for a complete study session with break',
      'Ideal for cooking prep work or timing quick recipes',
      'Try 10-minute power cleaning sessions to quickly tidy a room without overwhelming yourself',
      'Use it for meditation or breathing exercises to build a daily mindfulness habit',
    ],
    faqSection: [
      {
        question: 'How is the 10-minute timer different from a 5-minute timer?',
        answer: 'The 10-minute timer provides double the duration, making it suitable for more substantial tasks like study blocks, meetings, or complete exercise circuits. It\'s ideal when you need focused time without the frequent interruptions of shorter intervals.',
      },
      {
        question: 'Is 10 minutes enough for effective studying?',
        answer: 'Yes, 10 minutes is excellent for focused study. It\'s enough time to work through practice problems, review notes, or complete a quiz without mental fatigue. Use multiple 10-minute sessions with short breaks for best results.',
      },
      {
        question: 'Can I use the 10-minute timer for Pomodoro breaks?',
        answer: 'Absolutely. Many people use a 10-minute timer as their break interval after 25-minute Pomodoro work sessions. This gives sufficient recovery time while maintaining productivity momentum.',
      },
      {
        question: 'What types of workouts work best with a 10-minute timer?',
        answer: 'Circuit training, HIIT workouts, cardio sessions, and complete yoga routines all work well with 10 minutes. You can do one exercise per minute or combine multiple exercises for longer durations.',
      },
      {
        question: 'How accurate is the VeroTime 10-minute timer?',
        answer: 'VeroTime uses precise timing mechanisms accurate to the millisecond. Our timer is designed for reliability across all devices, ensuring consistent accuracy for your time-sensitive activities.',
      },
    ],
    relatedTimers: ['5-minute-timer', '15-minute-timer', '25-minute-timer', '20-minute-timer', '30-minute-timer'],
  },
  {
    duration: 900,
    slug: '15-minute-timer',
    title: 'Free 15 Minute Timer - Perfect for Focused Work',
    description: 'Reliable 15 minute timer for productive work blocks, meditation, or fitness routines. Clean, simple, and completely free.',
    content: `Take advantage of a focused 15 minute work block with our precision timer. This duration is ideal for meditation sessions, workout circuits, short presentations, or focused study periods. Set it and forget it—our timer handles the counting while you focus on the task at hand. The 15-minute interval is particularly effective for activities requiring sustained focus without overwhelming time pressure. Whether you're building a meditation practice, conducting a training session, or powering through a focused work sprint, 15 minutes provides the optimal window for meaningful progress.`,
    keywords: ['15 minute timer', '15 min timer', 'work timer', 'meditation timer', 'fitness timer', 'focused work timer', 'presentation timer'],
    uses: ['Meditation', 'Focused work', 'Workout circuits', 'Presentations', 'Study blocks'],
    category: 'wellness',
    whySection: `The 15-minute timer hits a sweet spot for many activities. It's long enough for deep work without requiring the extended commitment of 30-minute blocks, yet substantial enough to make meaningful progress. In meditation practice, 15 minutes allows the mind to settle into a focused state and experience real benefits. For fitness, it provides time for a complete circuit including warm-up, exercises, and cool-down. For work, it's ideal for focused sprints on specific tasks before transitioning to another activity. Research in attention span shows that 15 minutes is within the optimal window for sustained focus before the brain requires a break.`,
    howToSection: `Begin by clicking "Start" on the 15-minute timer interface. The countdown will display prominently, making it easy to monitor progress. For meditation, find a quiet space, sit comfortably, and begin your practice when the timer starts. For work, eliminate all distractions and focus on a single task for the full duration. For fitness, perform your planned exercises or circuits with the timer running in the background. The timer can be paused if needed, though for best results try to maintain the full 15-minute duration. When the timer sounds, you'll have a clear stopping point and can assess progress or transition to your next activity.`,
    tipsSection: [
      'Use the 15-minute timer as your primary meditation duration for building a consistent practice',
      'Time 15-minute power work sessions for maximum productivity without burnout',
      'Perfect for 15-minute workout circuits—use 1 minute per exercise across 15 movements',
      'Use back-to-back 15-minute timers (45 minutes) for longer focused work or classes',
      'Ideal for practicing presentations or speeches until you can complete them smoothly',
      'Use for focused learning sessions before switching to a different subject',
      'Great for timed yoga or stretching routines to improve flexibility',
    ],
    faqSection: [
      {
        question: 'How long should I meditate with the 15-minute timer?',
        answer: 'The 15-minute duration is ideal for meditation. It\'s long enough to experience the benefits of settling the mind (usually 3-5 minutes to quiet mental chatter) while remaining manageable for beginners. As your practice deepens, you can extend to longer sessions.',
      },
      {
        question: 'Can the 15-minute timer help with fitness training?',
        answer: 'Yes! A 15-minute timer is excellent for circuit training. You can do 1 minute per exercise (15 exercises), or create different combinations. It\'s enough for a complete workout including warm-up and cool-down.',
      },
      {
        question: 'What type of work is best suited for a 15-minute session?',
        answer: 'Use 15-minute sessions for focused work on single tasks: writing, coding, design work, analysis, or problem-solving. It\'s long enough for deep focus but short enough to maintain intensity.',
      },
      {
        question: 'How many 15-minute sessions should I do per day?',
        answer: 'Most people find 2-4 sessions per day optimal. After each 15-minute session, take a 3-5 minute break, then you can start another cycle. Listen to your body and mind.',
      },
      {
        question: 'Is the 15-minute timer suitable for classroom use?',
        answer: 'Yes! Teachers often use 15-minute timers to structure lessons and activities. It\'s long enough for substantive work but keeps activities moving and maintains student engagement.',
      },
    ],
    relatedTimers: ['10-minute-timer', '20-minute-timer', '25-minute-timer', '30-minute-timer'],
  },
  {
    duration: 1200,
    slug: '20-minute-timer',
    title: 'Free 20 Minute Timer - Focus & Productivity',
    description: 'Clean 20 minute countdown timer for deep work sessions, meetings, or training. Start your focused work session now.',
    content: `The 20 minute timer strikes the perfect balance between quick tasks and deep focus. It's the ideal duration for intensive study sessions, creative work blocks, team meetings, or workout routines. Our simple, distraction-free design helps you stay on track. The 20-minute interval represents a proven sweet spot in productivity research—long enough to enter a flow state for most tasks, yet short enough to maintain peak concentration throughout. Whether you're tackling a creative project, conducting a business meeting, or building an exercise routine, the 20-minute timer ensures meaningful progress without fatigue.`,
    keywords: ['20 minute timer', '20 min timer', 'focus timer', 'work timer', 'meeting timer', 'deep work timer', 'creative work timer'],
    uses: ['Deep work sessions', 'Study blocks', 'Meetings', 'Training sessions', 'Creative work'],
    category: 'productivity',
    whySection: `The 20-minute timer is scientifically optimal for deep work and flow state entry. Research shows that most people need 3-5 minutes to fully engage with a task, making 20 minutes ideal—it provides 15-17 minutes of productive work after initial focus time. In creative fields like writing, design, or programming, 20 minutes allows enough time to solve meaningful problems without overextending. For meetings, 20 minutes keeps discussions focused and prevents time-wasting. For exercise, it provides adequate time for a complete workout including warm-up. The 20-minute mark is also used in time-blocking strategies by productivity experts worldwide.`,
    howToSection: `Click "Start" to begin your 20-minute session. Set up your work environment beforehand—close unnecessary tabs, silence notifications, and gather materials you'll need. For creative work, use the first minute to review your goals, then dive into focused work for 18 minutes, spending the last minute summarizing progress. For meetings, outline discussion points before starting to keep conversations on track. For exercise, allocate 2 minutes warm-up, 16 minutes for main workout, 2 minutes cool-down. The timer will alert you when 20 minutes have elapsed, giving you a natural stopping point to assess progress or transition to your next activity.`,
    tipsSection: [
      'Use the 20-minute timer for your most important daily task—schedule it first thing for best results',
      'Combine three 20-minute sessions with 5-minute breaks for a full 75-minute work cycle',
      'Perfect for creative work blocks—try the Pomodoro alternative of 20 work + 5 break',
      'Set specific meeting agendas to stay on track during your 20-minute meeting timer',
      'Use for complete workout sessions: 2-min warm-up + 16-min exercise + 2-min cool-down',
      'Ideal for focused learning of complex subjects before switching topics',
      'Use back-to-back 20-minute sessions (40 minutes) for in-depth project work',
    ],
    faqSection: [
      {
        question: 'How is the 20-minute timer different from the 25-minute Pomodoro timer?',
        answer: 'The 20-minute timer provides 5 minutes less than the classic Pomodoro interval. Some people find 20 minutes more sustainable, especially when doing multiple sessions. It\'s better for shorter deep work sprints.',
      },
      {
        question: 'Can I use the 20-minute timer for exercise?',
        answer: 'Yes! Twenty minutes is excellent for complete workout routines. You can do 20 minutes of cardio, strength training, or mixed workouts. It\'s long enough for effectiveness but short enough for busy schedules.',
      },
      {
        question: 'Is 20 minutes long enough for a productive work session?',
        answer: 'Absolutely. 20 minutes is ideal for focused work on specific tasks. Many productivity experts recommend 20-minute focused sprints as more sustainable than longer blocks, especially when done in multiples.',
      },
      {
        question: 'How many 20-minute sessions should I do per day?',
        answer: 'Most people can sustain 4-6 focused 20-minute sessions per day with 5-minute breaks between. This creates a 130-minute productive workday with built-in recovery time.',
      },
      {
        question: 'What types of meetings work best with a 20-minute timer?',
        answer: 'Team standups, one-on-ones, status updates, and brainstorming sessions all fit well within 20 minutes. Prepare an agenda beforehand and stick to it to make the most of the time.',
      },
    ],
    relatedTimers: ['15-minute-timer', '25-minute-timer', '10-minute-timer', '30-minute-timer'],
  },
  {
    duration: 1500,
    slug: '25-minute-timer',
    title: 'Free 25 Minute Timer - The Pomodoro Standard',
    description: 'Classic 25 minute Pomodoro timer for productivity and focus. Perfect for work sprints, studying, or project management.',
    content: `The 25 minute timer is the original Pomodoro interval—trusted by millions for managing attention and maximizing productivity. Whether you're tackling a project, studying for exams, or diving into creative work, this timer helps you work in focused bursts with built-in breaks. The 25-minute Pomodoro technique was developed by Francesco Cirillo in the late 1980s based on research about optimal work-rest cycles. This duration has been proven effective across countless studies and is recommended by productivity coaches, entrepreneurs, and students worldwide. Using 25-minute focused intervals dramatically increases output while reducing mental fatigue.`,
    keywords: ['25 minute timer', 'Pomodoro timer', 'productivity timer', 'focus timer', 'work timer', 'Pomodoro technique timer', 'study timer'],
    uses: ['Pomodoro technique', 'Project work', 'Exam preparation', 'Creative projects', 'Professional tasks'],
    category: 'productivity',
    whySection: `The 25-minute Pomodoro interval is the gold standard for productivity. Research shows that 25 minutes hits the optimal window for sustained focus—long enough to enter flow state and make meaningful progress, yet short enough to maintain peak mental performance. The technique pairs 25-minute work intervals with 5-minute breaks, allowing the brain to rest and consolidate information. Francesco Cirillo's research found that this cycle optimizes both productivity and quality of work. Users report completing more tasks in less time, experiencing less burnout, and achieving better work quality. The predictability of the 25-minute cycle helps the brain anticipate breaks and sustain focus knowing rest is coming.`,
    howToSection: `Start your Pomodoro session by clicking "Start" on the 25-minute timer. Before beginning, clearly define what you'll accomplish during this interval—write it down if possible. Eliminate all distractions: silence notifications, close unrelated tabs, and remove physical clutter. When the timer starts, work exclusively on your defined task with full focus. If a distraction or new task comes to mind, note it for later. When the timer sounds, take a 5-minute break: stretch, get water, rest your eyes. After four 25-minute sessions, take a longer 15-30 minute break. This cycle maximizes sustained productivity throughout your day.`,
    tipsSection: [
      'Use the Pomodoro timer for your most challenging tasks—timing makes them less intimidating',
      'Combine with task lists: assign specific Pomodoro intervals to different tasks for better planning',
      'Take your 5-minute breaks seriously—step away from work and rest your brain',
      'After four 25-minute sessions, take a longer break to recharge',
      'Track completed Pomodoros to visualize productivity and build motivation',
      'Combine with other techniques: Pomodoro + time-blocking for maximum efficiency',
      'Use for group work: have team members work together during 25-minute focused sessions',
    ],
    faqSection: [
      {
        question: 'What is the Pomodoro Technique?',
        answer: 'The Pomodoro Technique is a time management method developed by Francesco Cirillo that uses 25-minute focused work intervals followed by 5-minute breaks. After four cycles, take a longer 15-30 minute break. It\'s based on the principle that regular breaks improve focus and productivity.',
      },
      {
        question: 'Can I adjust the 25-minute interval if I need more or less time?',
        answer: 'While 25 minutes is the classic duration, some people use 20 or 30 minutes depending on their task and focus level. Experiment to find what works best for you, but 25 minutes is recommended for beginners.',
      },
      {
        question: 'What should I do during my 5-minute Pomodoro break?',
        answer: 'Step away from your work. Stretch, get a drink of water, walk around, or rest your eyes. Avoid screens or other work. The goal is to let your brain recover before the next session.',
      },
      {
        question: 'How many Pomodoros should I do in a day?',
        answer: 'Most people aim for 8-12 Pomodoros per day (roughly 3-5 hours of focused work). This varies based on your job and energy levels. Listen to your body—quality matters more than quantity.',
      },
      {
        question: 'Is the Pomodoro timer good for study?',
        answer: 'Yes! The Pomodoro timer is excellent for studying. Students report improved focus, better retention of information, and reduced procrastination. It\'s particularly effective for exam preparation.',
      },
    ],
    relatedTimers: ['20-minute-timer', '5-minute-timer', '30-minute-timer', '10-minute-timer', '15-minute-timer'],
  },
  {
    duration: 1800,
    slug: '30-minute-timer',
    title: 'Free 30 Minute Timer - Extended Focus Sessions',
    description: 'Reliable 30 minute timer for longer work sessions, training, or meditation. Free, simple, and effective.',
    content: `Give yourself 30 minutes of uninterrupted time with our precision timer. This duration is perfect for longer study sessions, extended workout routines, meditation practices, cooking, or comprehensive work blocks. Our clean interface keeps you focused on what you're doing. The 30-minute interval is increasingly popular among professionals who find it offers the perfect balance for deep work. It's long enough to tackle complex problems and achieve meaningful progress, yet structured enough to maintain focus throughout. Whether you're learning new skills, conducting workouts, or advancing major projects, the 30-minute timer provides optimal duration for sustained effort.`,
    keywords: ['30 minute timer', '30 min timer', 'workout timer', 'study timer', 'meditation timer', 'extended focus timer', 'yoga timer'],
    uses: ['Extended work sessions', 'Workouts', 'Meditation', 'Cooking', 'Training routines'],
    category: 'fitness',
    whySection: `The 30-minute timer is ideal for activities requiring sustained focus and effort. It's long enough to complete full workouts with warm-up, exercise, and cool-down phases. In meditation, 30 minutes allows practitioners to experience profound benefits beyond the settling-in period. For work, it enables deep dives into complex problems without interruption. The 30-minute mark aligns with research on optimal exercise duration for cardiovascular health and strength training. Many professionals use 30-minute blocks as their standard focused work unit, finding it more achievable than longer sessions while producing substantial results.`,
    howToSection: `Click "Start" to begin your 30-minute session. For workouts, use the first 2-3 minutes for warm-up, 24-26 minutes for your main activity, and the last 1-2 minutes for cool-down. For meditation, sit comfortably, begin your practice when the timer starts, and allow your mind to settle naturally. For work, eliminate distractions and commit to focused effort on a single task. For cooking, prepare ingredients beforehand so you can use the full 30 minutes for actual cooking. The timer's clear display keeps you aware of time without constant checking, allowing you to stay immersed in your activity.`,
    tipsSection: [
      'Perfect for complete workout routines—30 minutes provides time for cardio, strength, or mixed training',
      'Use for extended study sessions on difficult subjects before switching topics',
      'Ideal for yoga or stretching routines to significantly improve flexibility',
      'Great for cooking—time prep work so the 30 minutes are for active cooking',
      'Use two back-to-back 30-minute sessions (60 minutes) for major project work',
      'Perfect for meditation—30 minutes allows the mind to settle and experience real benefits',
      'Use for professional development: reading technical books, online courses, or skill training',
    ],
    faqSection: [
      {
        question: 'Is 30 minutes long enough for a complete workout?',
        answer: 'Yes! Thirty minutes is excellent for a complete workout including warm-up and cool-down. You can do cardio, strength training, or mixed workouts. Research shows 30-minute workouts provide significant health benefits.',
      },
      {
        question: 'How should I structure a 30-minute meditation session?',
        answer: 'Typically: 1-2 minutes settling in, 27-28 minutes of meditation, 1 minute closing. Allow your mind to naturally settle rather than forcing it. Even if your mind wanders, the practice is valuable.',
      },
      {
        question: 'Is 30 minutes enough time to make progress on a major project?',
        answer: 'Yes. Thirty minutes of focused work produces significant progress. For major projects, use multiple 30-minute sessions with breaks between. Many successful professionals use 30-minute focused blocks.',
      },
      {
        question: 'What type of cooking can I do in 30 minutes?',
        answer: 'Many dinner recipes fit within 30 minutes: stir-fries, pasta dishes, quick proteins with vegetables, soups, and more. Prepare ingredients beforehand to maximize cooking time.',
      },
      {
        question: 'Can I pause the 30-minute timer mid-session?',
        answer: 'Yes, the timer includes pause functionality. However, for best results with workouts or meditation, try to complete the full 30 minutes uninterrupted.',
      },
    ],
    relatedTimers: ['25-minute-timer', '20-minute-timer', '45-minute-timer', '60-minute-timer', '15-minute-timer'],
  },
  {
    duration: 2700,
    slug: '45-minute-timer',
    title: 'Free 45 Minute Timer - Long Focus Sessions',
    description: '45 minute countdown timer perfect for comprehensive work sessions, classes, or extended activities. Clean and reliable.',
    content: `The 45 minute timer is ideal for longer work sessions, class periods, intensive training, or substantial projects. This extended duration gives you enough time to achieve deep focus and meaningful progress. Perfect for academics, professionals, and anyone committed to sustained effort. The 45-minute interval bridges the gap between quick focused sprints and full-hour commitments. Many educational institutions use 45-minute class periods because research shows this duration optimally balances content delivery with student attention span. For work, 45 minutes allows complex projects to move from conception to significant completion.`,
    keywords: ['45 minute timer', '45 min timer', 'class timer', 'work timer', 'training timer', 'long focus timer', 'extended session timer'],
    uses: ['Classes or lectures', 'Long work sessions', 'Intensive training', 'Project work', 'Comprehensive tasks'],
    category: 'learning',
    whySection: `The 45-minute interval is the standard duration for academic class periods worldwide, chosen because it optimizes the attention span of learners. Research shows that 45 minutes provides enough time for meaningful content delivery and engagement while staying within the natural attention curve. For work, 45 minutes allows deep dives into complex problems with space for meaningful progress. Three 45-minute work sessions with breaks equals 2.25 hours of intense focus—highly productive for any professional. The duration is long enough to enter deep flow state yet structured enough to prevent overwhelming fatigue.`,
    howToSection: `Start by clicking the "Start" button on your 45-minute timer. For classroom or training use, organize your content beforehand: plan how you'll structure the 45 minutes to maintain engagement (avoid lecturing the entire time). For work, identify a substantial goal you want to accomplish in the 45 minutes. Set it at the beginning so you have a target. For training, design a comprehensive curriculum that uses the full 45 minutes effectively. Use the timer as a boundary—when it sounds, you have a natural transition point. Take a 10-15 minute break after each 45-minute session before starting another.`,
    tipsSection: [
      'Structure your 45 minutes with breaks for student engagement—alternate presentation and activity every 10-15 minutes',
      'Use for comprehensive project work with clear milestones at 15, 30, and 45 minutes',
      'Perfect for training sessions—45 minutes is standard for fitness classes and skills training',
      'Use back-to-back 45-minute sessions (with 15-minute break) for full-length seminars',
      'Ideal for writing projects—multiple 45-minute sessions maintain writing flow',
      'Use for intensive study sessions on challenging material',
      'Great for video-based learning—most quality educational videos fit within 45 minutes',
    ],
    faqSection: [
      {
        question: 'Why is 45 minutes the standard classroom duration?',
        answer: 'Research shows that 45 minutes balances content delivery with student attention span. It\'s long enough for meaningful learning but short enough to keep students engaged. This is why it\'s used globally in education.',
      },
      {
        question: 'Can I teach or train effectively for 45 minutes?',
        answer: 'Yes, but vary your delivery: use 10-15 minute segments of lecture/content followed by activities or discussion. This maintains engagement throughout the 45 minutes.',
      },
      {
        question: 'How much work progress can I make in 45 minutes?',
        answer: 'Significant progress! 45 minutes of focused work on a single task produces substantial results. For complex work, use multiple 45-minute sessions with breaks between.',
      },
      {
        question: 'Is 45 minutes good for fitness training?',
        answer: 'Yes! Forty-five minutes is a common duration for group fitness classes. It\'s enough time for warm-up, main workout, and cool-down while fitting into busy schedules.',
      },
      {
        question: 'How should I structure a 45-minute work session?',
        answer: 'Spend 2 minutes on setup, 41 minutes on focused work, 2 minutes on documenting progress. Or use checkpoint approach: set milestones at 15, 30, and 45 minutes.',
      },
    ],
    relatedTimers: ['30-minute-timer', '60-minute-timer', '20-minute-timer', '25-minute-timer'],
  },
  {
    duration: 3600,
    slug: '60-minute-timer',
    title: 'Free 60 Minute Timer (1 Hour) - Full Focus Block',
    description: '1 hour countdown timer for full work sessions, meetings, or substantial projects. Precise and distraction-free.',
    content: `A full hour of focused time with our reliable 60 minute timer. This extended duration is perfect for comprehensive meetings, major project phases, extended study sessions, or professional work blocks. Use it for webinars, presentations, or any task requiring sustained attention. The 60-minute (1-hour) interval is the gold standard for focused work sessions in modern productivity practices. It provides enough time to complete meaningful work on substantial tasks while remaining manageable as a single focused block. Many professionals structure their days in 1-hour intervals, combining deep work with breaks and collaboration.`,
    keywords: ['60 minute timer', '1 hour timer', '1hr timer', 'meeting timer', 'work timer', 'full hour timer', 'webinar timer'],
    uses: ['Meetings', 'Webinars', 'Major project phases', 'Study marathons', 'Professional work'],
    category: 'productivity',
    whySection: `The 60-minute timer represents a full, focused work block—the benchmark for professional productivity. One hour is long enough to complete substantial work on meaningful projects while remaining achievable as a single focused session. Research on project management shows that 60-minute focus blocks are optimal for complex work requiring sustained attention. For meetings, 60 minutes provides time for comprehensive discussion without dragging on. For study, it's ideal for deep engagement with difficult material. The 1-hour mark aligns with how many organizations structure their calendars and work blocks.`,
    howToSection: `Click "Start" to begin your 60-minute session. Before starting, clearly identify what you'll accomplish: finish a report section, complete a project phase, conduct a comprehensive meeting, or master a topic. Set up your environment: eliminate distractions, ensure you have all necessary materials, silence notifications. Divide the hour into three 20-minute chunks with brief mental breaks between them (you can take them internally without pausing the timer). When the timer sounds, you've completed a full work block—celebrate your progress. Take a 10-15 minute break before starting another hour or transitioning to a different task.`,
    tipsSection: [
      'Use the 60-minute timer for your most important daily work—schedule in peak energy hours',
      'Structure your hour: 20 minutes each for three segments with natural transitions',
      'Perfect for comprehensive meetings—most discussions fit naturally within 60 minutes',
      'Use back-to-back 60-minute sessions (with 20-minute breaks) for full workdays',
      'Ideal for detailed study sessions on complex or difficult material',
      'Use for webinars and online training—60 minutes is standard for professional development',
      'Excellent for first drafts of significant work projects',
    ],
    faqSection: [
      {
        question: 'Can I maintain focus for a full 60 minutes?',
        answer: 'Yes, for most people. The key is proper preparation and eliminating distractions beforehand. Structure the hour into 20-minute chunks with brief mental breaks. Most professionals find 60-minute focus blocks sustainable.',
      },
      {
        question: 'What type of work is best for a 60-minute session?',
        answer: 'Complex work requiring sustained focus: writing, coding, design, strategic planning, detailed analysis, or learning difficult material. Sixty minutes provides enough time for meaningful progress.',
      },
      {
        question: 'How many 60-minute sessions should I do per day?',
        answer: 'Most professionals complete 2-3 focused 60-minute sessions per day. Add breaks between sessions. This creates a highly productive workday with sustainable effort levels.',
      },
      {
        question: 'Is 60 minutes a good meeting duration?',
        answer: 'Yes! Sixty minutes is ideal for comprehensive meetings. It allows time for full discussion without becoming overly long. Set a clear agenda and stick to time allocations for different topics.',
      },
      {
        question: 'Can I use the 60-minute timer for study?',
        answer: 'Absolutely. Sixty minutes is excellent for deep study sessions on challenging material. You can make significant progress in one hour with focused effort and minimal distractions.',
      },
    ],
    relatedTimers: ['45-minute-timer', '30-minute-timer', '25-minute-timer', '50-minute-timer'],
  },
  // PHASE 2: High-Priority New Timers
  {
    duration: 3000,
    slug: '50-minute-timer',
    title: 'Free 50 Minute Timer - Deep Work Focus Block',
    description: 'Dedicated 50-minute timer for deep work, research, and complex projects. Ideal for ultradian rhythm-based productivity methods.',
    content: `The 50-minute timer is designed for professionals who want to maximize deep work sessions. Based on research into ultradian rhythms, 50 minutes provides an optimal window for focused concentration on complex tasks. This duration works perfectly as part of the 90-minute power session methodology, allowing 50 minutes of intense focus followed by a 40-minute break. Whether you're coding, writing, researching, or working on strategic projects, the 50-minute timer helps you achieve meaningful progress while respecting your brain's natural focus cycles.`,
    keywords: ['50 minute timer', '50 min timer', 'deep work timer', 'focus timer', 'research timer', 'ultradian rhythm timer', 'productivity timer'],
    uses: ['Deep work sessions', 'Research projects', 'Complex coding', 'Strategic planning', 'Writing projects'],
    category: 'productivity',
    whySection: `The 50-minute interval aligns with research on optimal work cycles and ultradian rhythms. Studies show that the human brain operates in roughly 90-minute cycles of high and low alertness. Using a 50-minute work timer leaves room for a 10-minute buffer, then allows for a 30-40 minute break before the next cycle. This approach is more sustainable than 60-minute blocks while providing significantly more focus time than shorter intervals. For complex tasks that require sustained cognitive effort, 50 minutes is the sweet spot—long enough to make real progress without cognitive overload.`,
    howToSection: `Begin your 50-minute session by clicking "Start." Before beginning, identify specifically what you'll accomplish: finish a code module, complete a chapter, or solve a problem. Set up your environment completely before starting—have all references, tools, and materials ready. Work with full focus for the entire 50 minutes, using techniques like the Pomodoro method if needed for smaller breaks within. When the timer sounds, take a proper break of 10-15 minutes minimum. This allows your brain to consolidate information and recover before the next session.`,
    tipsSection: [
      'Combine 50-minute work with 40-minute breaks for complete ultradian rhythm cycles',
      'Perfect for research projects requiring sustained focus on complex material',
      'Use for coding projects requiring deep concentration and problem-solving',
      'Ideal for strategic planning and decision-making that requires full mental engagement',
      'Great for writing projects where you need to maintain flow and narrative coherence',
      'Use multiple 50-minute sessions per day (typically 1-2 max) to avoid exhaustion',
      'Combine with 30-minute or 25-minute sessions for varied productivity strategies',
    ],
    faqSection: [
      {
        question: 'How is a 50-minute timer different from a 45-minute timer?',
        answer: 'The 50-minute timer provides 5 additional minutes for deeper work. It\'s particularly useful for aligning with ultradian rhythm research and provides more time for complex tasks to reach meaningful completion.',
      },
      {
        question: 'What is the ideal break after a 50-minute session?',
        answer: 'A 10-15 minute break is ideal. This allows your brain to process information without losing momentum. Some prefer 40-minute breaks following the 90-minute ultradian cycle.',
      },
      {
        question: 'What types of work are best for a 50-minute focus block?',
        answer: 'Complex work requiring deep focus: research, coding, writing, strategic analysis, and problem-solving. Fifty minutes allows you to enter deep flow state on substantial tasks.',
      },
      {
        question: 'Can I use the 50-minute timer for study?',
        answer: 'Yes! It\'s excellent for study, particularly for complex subjects like advanced mathematics, programming, or research papers. The extended time helps build understanding.',
      },
      {
        question: 'How many 50-minute sessions can I do per day?',
        answer: 'Most people can sustain 1-2 high-quality 50-minute sessions per day. More is possible if combined with shorter sessions, but quality of focus decreases with exhaustion.',
      },
    ],
    relatedTimers: ['45-minute-timer', '60-minute-timer', '25-minute-timer', '30-minute-timer'],
  },
  {
    duration: 5400,
    slug: '90-minute-timer',
    title: 'Free 90 Minute Timer - Power Session Productivity',
    description: 'Optimal 90-minute timer based on ultradian rhythm research. Perfect for power sessions, comprehensive projects, and flow state achievement.',
    content: `The 90-minute timer is scientifically designed based on research into human ultradian rhythms—the natural 90-minute cycles of energy and focus that govern our productive capacity. Using a 90-minute power session creates optimal conditions for achieving flow state and making substantial progress on significant projects. Athletes, researchers, and creative professionals use 90-minute blocks for their most important work. This extended duration requires excellent environmental setup but delivers unparalleled results for complex problem-solving and creative endeavors.`,
    keywords: ['90 minute timer', '90 min timer', 'power session timer', 'ultradian rhythm timer', 'flow state timer', 'deep work timer', '1.5 hour timer'],
    uses: ['Power sessions', 'Major projects', 'Flow state work', 'Comprehensive research', 'Strategic initiatives'],
    category: 'productivity',
    whySection: `The 90-minute timer is based on groundbreaking research by William Kleitman on ultradian rhythms—the natural biological cycles that govern energy and focus throughout the day. Unlike circadian rhythms (24-hour cycles), ultradian rhythms operate on approximately 90-minute cycles. During these cycles, the brain experiences high alertness, focus, and capacity for complex work. After 90 minutes, the brain naturally requires a 20-30 minute break to recover. By aligning your work with these natural cycles, you achieve optimal productivity while reducing mental fatigue. Professional athletes, scientists, and entrepreneurs use 90-minute power sessions for their most important work because the results are demonstrably superior.`,
    howToSection: `Prepare thoroughly before starting your 90-minute power session. Gather all necessary materials, references, and tools. Close all distracting applications and notifications. Click "Start" on the timer and commit fully to your defined goal for 90 minutes. Unlike shorter sessions, this extended time allows you to enter deep flow state where time perception diminishes and productivity soars. Work continuously for the full 90 minutes—resist checking time or switching tasks. When the timer sounds, you've earned a substantial break (20-30 minutes is ideal). Use the break to eat, exercise, or rest before starting your next cycle.`,
    tipsSection: [
      'Use a 90-minute power session for your most important daily work—schedule during peak energy',
      'After each 90-minute session, take a 20-30 minute break to allow brain recovery',
      'Three 90-minute sessions with breaks equals a highly productive 4.5-hour workday',
      'Perfect for tackling major projects, strategic initiatives, or complex creative work',
      'Ideal for learning new skills deeply—the extended time enables comprehension',
      'Use back-to-back sessions only occasionally, as sustainable productivity requires recovery',
      'Combine with optimal environment: quiet space, good lighting, comfortable temperature',
    ],
    faqSection: [
      {
        question: 'What is an ultradian rhythm and why is 90 minutes important?',
        answer: 'An ultradian rhythm is a biological cycle that occurs multiple times daily, approximately every 90 minutes. Your brain naturally cycles through periods of high and low alertness. Using 90-minute work blocks aligns with these natural rhythms for optimal productivity.',
      },
      {
        question: 'Can I maintain focus for the full 90 minutes?',
        answer: 'Yes, most people find it easier than expected. Once you enter flow state (usually 5-10 minutes in), the remaining 80-85 minutes pass quickly. Key is proper preparation and zero distractions.',
      },
      {
        question: 'What should I do during my break after a 90-minute session?',
        answer: 'Take a 20-30 minute break to fully recover. Move your body, eat healthy food, drink water, get fresh air, or rest. Avoid screens and mentally demanding tasks.',
      },
      {
        question: 'How many 90-minute power sessions can I do per day?',
        answer: 'Most people can sustain 2 high-quality 90-minute sessions per day (5-6 hours of work with breaks). Three is possible but often leads to diminishing returns.',
      },
      {
        question: 'Is the 90-minute timer good for any type of work?',
        answer: 'It\'s best for complex, cognitively demanding work: strategic planning, creative projects, technical problem-solving, research, and learning. Less ideal for routine, administrative tasks.',
      },
    ],
    relatedTimers: ['60-minute-timer', '50-minute-timer', '45-minute-timer', '25-minute-timer'],
  },
  {
    duration: 1200,
    slug: 'hiit-interval-timer',
    title: 'Free HIIT Interval Timer - High Intensity Workout',
    description: 'Specialized HIIT interval timer for high-intensity interval training. Perfect for efficient workouts, metabolic conditioning, and fat burning.',
    content: `The HIIT interval timer is specifically designed for high-intensity interval training workouts. HIIT is one of the most efficient exercise methodologies, proven to deliver maximum results in minimal time. Using intervals of intense effort followed by recovery periods, HIIT workouts boost metabolism, build strength, and improve cardiovascular health. Our timer makes it easy to structure intervals: set work duration, rest duration, and number of rounds. Whether you're doing 20 seconds on/40 seconds off Tabata intervals or custom work-rest ratios, the HIIT timer keeps you on schedule for optimal training.`,
    keywords: ['HIIT timer', 'interval timer', 'workout timer', 'Tabata timer', 'high intensity timer', 'interval training timer', 'fitness timer'],
    uses: ['HIIT workouts', 'Tabata training', 'Circuit training', 'Cardio intervals', 'Strength training'],
    category: 'fitness',
    whySection: `HIIT (High-Intensity Interval Training) is scientifically proven to be one of the most efficient exercise methods. Research shows that 20 minutes of HIIT produces similar cardiovascular and metabolic benefits to 60 minutes of moderate cardio. The key to HIIT effectiveness is strict timing of work and rest intervals. During high-intensity periods (typically 20-40 seconds), you work at 80-100% maximum effort. Recovery periods (usually 20-40 seconds) allow enough partial recovery to perform another intense bout. This cycle creates an "afterburn effect" where metabolism remains elevated for hours post-workout.`,
    howToSection: `Start your HIIT workout by clicking "Start" on the timer. Warm up for 2-3 minutes with light movement. The most common HIIT format is 20 seconds of maximum effort followed by 40 seconds of recovery (Tabata). During the work intervals, push as hard as possible with your chosen exercise (burpees, sprints, jumping jacks, etc.). During recovery periods, perform the same movement at minimal intensity to keep your heart rate elevated. Complete 8-10 rounds of this cycle (20-25 minutes total including warm-up). Cool down with light movement for 2-3 minutes. The timer will alert you when each interval ends so you can focus on execution.`,
    tipsSection: [
      'Start with 20-30 second work intervals if you\'re new to HIIT—build up to 40-45 seconds',
      'Use 1:2 work-to-rest ratio for recovery: 30 seconds work, 60 seconds rest',
      'Alternate different exercises for each round to work different muscle groups',
      'Push yourself hard during work intervals—HIIT only works with genuine intensity',
      'Adjust rest periods based on fitness level: less fit people need longer recovery',
      'Combine multiple rounds for complete full-body workouts',
      'HIIT 2-3 times per week is ideal; allow 48 hours between sessions for recovery',
    ],
    faqSection: [
      {
        question: 'What is HIIT and why is it effective?',
        answer: 'HIIT (High-Intensity Interval Training) alternates between short bursts of intense effort and recovery periods. It\'s highly effective because it maximizes calorie burn, boosts metabolism, and improves cardiovascular fitness in minimal time.',
      },
      {
        question: 'What is the best work-to-rest ratio for HIIT?',
        answer: 'Common ratios are 1:1 (30 sec work, 30 sec rest), 1:2 (30 sec work, 60 sec rest), or Tabata (20 sec work, 40 sec rest). Beginners often prefer 1:2. More advanced athletes use 1:1 or even less rest.',
      },
      {
        question: 'How long should a HIIT workout be?',
        answer: 'Typically 15-30 minutes including warm-up and cool-down. The actual high-intensity work might be 10-20 minutes. Shorter HIIT sessions deliver significant results.',
      },
      {
        question: 'Can beginners do HIIT workouts?',
        answer: 'Yes, but modify intensity and duration. Start with lower work ratios (20 sec work, 60 sec rest), fewer rounds, and lower-impact exercises. Gradually increase intensity as fitness improves.',
      },
      {
        question: 'How often should I do HIIT workouts?',
        answer: 'HIIT is demanding, so 2-3 times per week is ideal for most people. Ensure 48 hours between sessions. Combine with lower-intensity exercise on other days.',
      },
    ],
    relatedTimers: ['30-minute-timer', '20-minute-timer', '15-minute-timer', '10-minute-timer'],
  },
  {
    duration: 600,
    slug: '10-minute-meditation-timer',
    title: 'Free 10 Minute Meditation Timer - Mindfulness Practice',
    description: 'Dedicated 10-minute meditation timer for mindfulness, breathing exercises, and daily meditation practice. Perfect for beginners and busy professionals.',
    content: `The 10-minute meditation timer is ideal for building a sustainable daily mindfulness practice. Ten minutes is long enough to experience the calming and focusing benefits of meditation, yet short enough to fit into even the busiest schedule. Meditation research shows that regular practice, even brief sessions, produces measurable improvements in stress reduction, focus, emotional regulation, and overall wellbeing. Whether you're starting a meditation practice or supplementing existing practice, the 10-minute timer provides the structure needed to establish consistent habit and maximize benefits.`,
    keywords: ['10 minute meditation', 'meditation timer', 'mindfulness timer', 'breathing timer', '10 min meditation', 'guided meditation timer', 'daily meditation'],
    uses: ['Meditation practice', 'Mindfulness sessions', 'Breathing exercises', 'Stress relief', 'Mental clarity'],
    category: 'wellness',
    whySection: `A 10-minute meditation is ideal for building a consistent practice while producing real benefits. Research shows that even 10 minutes of daily meditation significantly reduces anxiety, improves focus, and enhances emotional regulation. The human brain takes approximately 3-5 minutes to settle into meditative focus, meaning a 10-minute session gives you 5-7 minutes of quality meditation. This duration fits realistically into daily schedules—morning, lunch break, or evening—making consistency easier to achieve. Regular 10-minute practice has been shown to rewire the brain for improved attention and emotional resilience over weeks and months.`,
    howToSection: `Find a quiet, comfortable place to sit. You can meditate in a chair, on a cushion, or anywhere you can sit with reasonable comfort and an upright posture. Click "Start" on the timer. Close your eyes or soften your gaze. Begin observing your natural breathing without trying to control it. When your mind wanders (it will), gently return attention to your breath without judgment. There's no "failure" in meditation—mind-wandering is normal. Continue this practice for the full 10 minutes. When the timer sounds, sit for another moment before opening your eyes, then gently transition to your next activity.`,
    tipsSection: [
      'Meditate at the same time daily to build habit—morning is ideal for focus benefits',
      'Start with a quiet, distraction-free environment as you\'re establishing practice',
      'Use meditation apps or recordings for guided meditations if sitting silently is challenging',
      'Expect mind-wandering—this is normal and part of the practice',
      'Gradually extend duration: 10 minutes daily, then move to 15 or 20 minutes after a few months',
      'Track your meditation with a simple log to maintain motivation and see progress',
      'Combine with other wellness practices: yoga, exercise, healthy eating',
    ],
    faqSection: [
      {
        question: 'Is 10 minutes long enough for meditation to be beneficial?',
        answer: 'Yes, definitely. Research shows that even 10 minutes of daily meditation produces measurable improvements in stress, anxiety, focus, and emotional regulation. Consistency matters more than duration.',
      },
      {
        question: 'What should I do if my mind keeps wandering?',
        answer: 'Mind-wandering is completely normal—even experienced meditators experience it. Simply notice when your mind wanders and gently return focus to your breath. This redirection is actually the meditation.',
      },
      {
        question: 'When is the best time to meditate?',
        answer: 'Morning meditation (before checking devices) is ideal for focus benefits throughout the day. But consistency matters more than timing, so meditate whenever fits your schedule.',
      },
      {
        question: 'Do I need complete silence to meditate?',
        answer: 'Complete silence is helpful but not essential. With practice, you can meditate in moderate noise. Consistent practice in the same quiet place helps establish the meditation habit.',
      },
      {
        question: 'What are the benefits of regular meditation?',
        answer: 'Regular 10-minute meditation improves focus, reduces anxiety and stress, enhances emotional regulation, improves sleep quality, and increases self-awareness—benefits visible within weeks of daily practice.',
      },
    ],
    relatedTimers: ['15-minute-timer', '20-minute-timer', '30-minute-timer', '5-minute-timer'],
  },
  {
    duration: 420,
    slug: '7-minute-workout-timer',
    title: 'Free 7 Minute Workout Timer - Quick Fitness',
    description: 'Scientifically-designed 7 minute workout timer perfect for busy professionals. Get fit even with a packed schedule using this quick workout timer.',
    content: `The 7-minute workout timer is based on scientific research showing that brief, intense exercise can deliver significant fitness benefits. The protocol (often called the "7-Minute Workout") combines 12 exercises performed for 30 seconds each with 10 seconds of rest. This equals roughly 7 minutes total and has been scientifically shown to improve cardiovascular fitness, strength, and metabolic health. Perfect for busy professionals, travelers, or anyone wanting to add movement to a packed day, the 7-minute timer makes fitness accessible to everyone.`,
    keywords: ['7 minute workout', '7 minute timer', 'quick workout timer', 'busy fitness timer', 'office workout timer', 'scientifically designed workout', 'micro workout'],
    uses: ['Quick workouts', 'Office fitness', 'Travel workouts', 'Micro exercise', 'Time-limited training'],
    category: 'fitness',
    whySection: `The 7-minute workout is backed by research published in the American College of Sports Medicine journal showing that brief, intense exercise produces measurable fitness improvements comparable to longer, moderate-intensity workouts. The key is using exercises that tax multiple muscle groups simultaneously (like push-ups, squats, lunges) and maintaining intensity throughout. Seven minutes is long enough to elevate heart rate, engage major muscle groups, and create fitness stimulus, yet short enough to fit into lunch breaks or before work. This makes consistent daily movement realistic for people claiming "no time for exercise."`,
    howToSection: `Click "Start" on the timer. Perform exercises in sequence: jumping jacks (30 sec), wall sit (30 sec), push-ups (30 sec), abdominal crunches (30 sec), chair step-ups (30 sec), squats (30 sec), tricep dips (30 sec), plank (30 sec), high knees running in place (30 sec), lunges (30 sec), push-up with rotation (30 sec), side plank (30 sec). Rest 10 seconds between each exercise. Modify exercises as needed based on fitness level (use wall for push-ups, bend knees, etc.). Go at high intensity—this is not about looking perfect, it's about effort.`,
    tipsSection: [
      'Warm up for 2 minutes with light activity before starting the 7-minute workout',
      'High intensity is key—push yourself safely; intensity produces the results',
      'Modify exercises based on fitness: wall push-ups, bent-knee push-ups, reduced ROM (range of motion)',
      'Do the 7-minute workout daily or several times per week for best results',
      'Cool down with stretching for 3-5 minutes after completing the workout',
      'Combine with healthy diet and adequate sleep for comprehensive fitness',
      'Use as supplementary exercise if you already have a workout routine',
    ],
    faqSection: [
      {
        question: 'Can a 7-minute workout really improve fitness?',
        answer: 'Yes, research shows that the 7-minute workout produces measurable improvements in cardiovascular fitness, strength, and metabolic health when done consistently with high intensity. Results visible in 4-8 weeks of daily practice.',
      },
      {
        question: 'Is the 7-minute workout suitable for beginners?',
        answer: 'Yes, but modify exercises. Use wall push-ups, reduce range of motion, take longer rests if needed. As fitness improves, increase intensity and reduce rest periods.',
      },
      {
        question: 'How often should I do the 7-minute workout?',
        answer: 'Daily is ideal, but 4-5 times per week provides good results. Even 3 times per week combined with other movement shows benefits. Recovery is important, so don\'t overtrain.',
      },
      {
        question: 'Can I use the 7-minute timer for other workouts?',
        answer: 'Absolutely. Use it for interval training, circuit training, stretching routines, or any activity requiring 7-minute timing. The timer is flexible.',
      },
      {
        question: 'What\'s the best time to do a 7-minute workout?',
        answer: 'Morning workouts boost energy and metabolism throughout the day. But any time is better than no time. Consistency matters more than timing.',
      },
    ],
    relatedTimers: ['10-minute-timer', '15-minute-timer', '5-minute-timer', '30-minute-timer'],
  },
  // PHASE 3: Remaining Timers
  {
    duration: 180,
    slug: '3-minute-timer',
    title: 'Free 3 Minute Timer - Quick Standup Timer',
    description: 'Compact 3-minute timer perfect for standup meetings, quick activities, and rapid time management. Great for agile teams and time-boxed discussions.',
    content: `The 3-minute timer is ideal for structured, time-boxed activities that need rapid execution. In agile environments, 3-minute standups keep team communications concise and focused. For daily activities, 3 minutes is perfect for quick tasks: brushing teeth, brief exercises, or rapid micro-breaks. The brevity of 3 minutes creates urgency and focus, making it excellent for activities where time constraints improve performance. Use it for quick motivational rounds, rapid brainstorming sessions, or any activity needing strict time boundaries.`,
    keywords: ['3 minute timer', '3 min timer', 'standup timer', 'quick timer', 'agile timer', 'meeting timer', 'scrum timer'],
    uses: ['Standups', 'Quick breaks', 'Rapid tasks', 'Brainstorming', 'Micro-activities'],
    category: 'productivity',
    whySection: `A 3-minute timer creates powerful time pressure that improves focus and reduces procrastination. Research shows that strict time limits improve decision-making quality and prevent over-analysis. For standups, 3 minutes per person keeps meetings moving while preventing tangents. The brevity creates urgency that eliminates small talk and focuses communication on essentials. For quick tasks, 3 minutes is ideal—just enough time to complete something small without major interruption, yet long enough to accomplish meaningful work.`,
    howToSection: `Click "Start" to begin your 3-minute countdown. For standups, the speaker has exactly 3 minutes to address: what was done, what's next, and blockers. When the timer sounds, transition to the next person. For quick exercises, you can fit 3-4 movements in 3 minutes. For quick breaks, use the 3 minutes to step away, stretch, or rest your mind. The short duration means you can do these frequently throughout your day.`,
    tipsSection: [
      'Perfect for daily standups: 3 minutes per person keeps 5-person meetings under 15 minutes',
      'Use for rapid brainstorming where time constraints boost creativity',
      'Great for quick exercise breaks: jumping jacks, stretches, or quick walks',
      'Ideal for timeboxing quick decisions: use 3 minutes to decide, then move on',
      'Use multiple 3-minute segments for varied activities throughout your day',
      'Perfect for microbreak timers to interrupt long sitting periods',
      'Great for teaching time management to children or students',
    ],
    faqSection: [
      {
        question: 'How many people can do a standup in 3 minutes?',
        answer: 'One person. For teams, calculate total time: 5 people × 3 minutes = 15 minutes total. This keeps standups efficient and focused.',
      },
      {
        question: 'Is 3 minutes enough time for a meaningful standup?',
        answer: 'Yes. Three minutes forces conciseness and prevents tangents. Most standups only need updates on current task, next task, and blockers.',
      },
      {
        question: 'What can I do in 3 minutes?',
        answer: 'Quick activities: light stretching, a few exercises, a quick walk, reviewing notes, a brief meditation, quick task completion, or conversation/standup.',
      },
      {
        question: 'How often can I use the 3-minute timer?',
        answer: 'Frequently! Use for multiple standups daily, throughout-day micro-breaks, or quick task sessions. The 3-minute format is perfect for frequent repetition.',
      },
      {
        question: 'Is the 3-minute timer good for team synchronization?',
        answer: 'Excellent. Standups with synchronized 3-minute timers keep everyone on schedule and aware of time constraints, improving communication efficiency.',
      },
    ],
    relatedTimers: ['5-minute-timer', '10-minute-timer', '15-minute-timer'],
  },
  {
    duration: 300,
    slug: '5-minute-break-timer',
    title: 'Free 5 Minute Break Timer - Perfect Recovery Interval',
    description: 'Dedicated 5-minute break timer designed to pair with focus sessions. Ideal for Pomodoro breaks and energy recovery between work blocks.',
    content: `The 5-minute break timer is specifically designed to pair with longer focus sessions. After 25 minutes of Pomodoro work or other focused activity, a 5-minute break provides crucial recovery time. This duration is scientifically optimal—long enough to actually rest your brain and body, yet short enough that you won't lose momentum on your main task. Use this timer during your breaks between work sessions, study blocks, or intense activities to ensure you take proper recovery time.`,
    keywords: ['5 minute break timer', 'break timer', 'Pomodoro break', 'recovery timer', 'rest timer', 'pause timer', '5 min break'],
    uses: ['Pomodoro breaks', 'Work recovery', 'Energy restoration', 'Mental breaks', 'Activity breaks'],
    category: 'wellness',
    whySection: `A 5-minute break is the scientifically optimal recovery interval after focused work. Research shows that 5-minute breaks significantly restore mental energy and prevent fatigue better than no breaks or longer breaks that interrupt momentum. The Pomodoro Technique uses 5-minute breaks between 25-minute work sessions because this combination maximizes sustained productivity. During a 5-minute break, your brain can rest and consolidate information, improving memory formation and reducing cognitive load for the next work session.`,
    howToSection: `After completing a focused work session, click "Start" on the 5-minute break timer. Step away from your work desk immediately—this is crucial for mental recovery. Use the break to: stretch your body, get water, step outside for fresh air, rest your eyes by looking at distant objects, or engage in light conversation. Avoid screens and mentally demanding tasks. When the timer sounds, you're refreshed and ready to return to focused work.`,
    tipsSection: [
      'Stand and move during your break—physical movement enhances recovery',
      'Look away from screens: focus on distant objects to rest your eyes',
      'Hydrate: drink water during breaks to maintain mental performance',
      'Pair with 25-minute work sessions for classic Pomodoro cycles',
      'Use breaks for light social interaction to improve mood',
      'Avoid checking work emails or messages during breaks—mental detachment matters',
      'Make breaks consistent: same duration helps your brain anticipate recovery',
    ],
    faqSection: [
      {
        question: 'What should I do during a 5-minute break?',
        answer: 'Step away, move your body, stretch, get water, look at distant objects, or have brief conversation. Avoid screens and work-related tasks.',
      },
      {
        question: 'Is 5 minutes enough for recovery?',
        answer: 'Yes. Research shows 5-minute breaks significantly restore mental energy. The key is actually stepping away and disengaging from work.',
      },
      {
        question: 'Should I take a 5-minute break after every work session?',
        answer: 'Yes, every work session should be followed by a break. After four 25-minute work sessions with 5-minute breaks, take a longer 15-30 minute break.',
      },
      {
        question: 'Can I use the 5-minute timer for activities other than breaks?',
        answer: 'Absolutely. Use it for light stretching, quick walks, brief meditation, or any 5-minute activity.',
      },
      {
        question: 'What makes breaks effective for productivity?',
        answer: 'Consistent breaks allow your brain to consolidate information, prevent fatigue buildup, and maintain peak focus during work sessions.',
      },
    ],
    relatedTimers: ['5-minute-timer', '25-minute-timer', '10-minute-timer', '20-minute-timer'],
  },
  {
    duration: 900,
    slug: '15-minute-reading-timer',
    title: 'Free 15 Minute Reading Timer - Focused Reading Sprint',
    description: 'Specialized 15-minute reading timer for focused reading sessions, speed reading practice, and comprehension improvement without distractions.',
    content: `The 15-minute reading timer is perfect for uninterrupted reading sessions that build reading habits and improve comprehension. Fifteen minutes is ideal for reading a complete article, a book chapter section, or sustained reading practice. The timer removes distractions and creates focused reading time. Whether you're improving reading speed, building daily reading habits, or tackling challenging texts, the 15-minute timer provides the structure needed for meaningful progress.`,
    keywords: ['15 minute reading timer', 'reading timer', 'reading sprint', 'speed reading timer', 'comprehension timer', 'focused reading', 'book timer'],
    uses: ['Reading practice', 'Speed reading', 'Article reading', 'Book chapters', 'Learning reading'],
    category: 'learning',
    whySection: `Fifteen minutes is ideal for a complete reading session. Most readers can complete 10-15 pages in 15 minutes, depending on difficulty and reading speed. A 15-minute focused reading session, repeated daily, builds a strong reading habit. Research shows that regular, focused reading improves comprehension, vocabulary, and general knowledge. The time constraint helps eliminate distractions and improves reading efficiency—you read faster when you know you have limited time.`,
    howToSection: `Find a quiet place and select your reading material. Click "Start" on the timer. Set a goal for your reading session: "Complete this article" or "Read 15 pages." Read with focus, minimizing interruptions. You can take notes if helpful. After 15 minutes, pause and reflect: what did you learn? What was important? This reflection improves retention. Use multiple 15-minute reading sessions daily to build a comprehensive reading practice.`,
    tipsSection: [
      'Read challenging material during morning reading sessions when focus is best',
      'Use the 15-minute timer to improve reading speed gradually',
      'Take notes while reading to boost comprehension and retention',
      'Choose reading material matched to your current skill level',
      'Do multiple 15-minute reading sessions daily for cumulative learning',
      'Eliminate distractions before starting: put away phone, close other tabs',
      'Vary reading material: mix fiction, non-fiction, technical, and light reads',
    ],
    faqSection: [
      {
        question: 'How many pages can I read in 15 minutes?',
        answer: 'Typical reading speed is 200-250 words per minute, which equals 10-15 pages depending on font size and material difficulty. Speed improves with practice.',
      },
      {
        question: 'Does reading with a timer improve reading speed?',
        answer: 'Yes! Time awareness improves reading pace. Regular timed reading sessions gradually increase your natural reading speed.',
      },
      {
        question: 'Is 15 minutes long enough to finish a complete reading task?',
        answer: 'Often yes for articles or book sections. For longer books, multiple 15-minute sessions work well. Break large reading into 15-minute chunks.',
      },
      {
        question: 'How can I improve comprehension while reading quickly?',
        answer: 'Active reading techniques: preview headings, read summaries, take notes, and reflect after reading. Speed and comprehension improve together with practice.',
      },
      {
        question: 'What should I read during my 15-minute sessions?',
        answer: 'Mix materials: non-fiction (learning), fiction (enjoyment), news (current events), or technical material (skills). Variety keeps reading engaging.',
      },
    ],
    relatedTimers: ['10-minute-timer', '20-minute-timer', '25-minute-timer', '30-minute-timer'],
  },
  {
    duration: 1200,
    slug: 'yoga-stretching-timer',
    title: 'Free 20 Minute Yoga Timer - Flexibility & Wellness',
    description: 'Complete 20-minute yoga and stretching timer for daily flexibility practice, injury prevention, and mind-body wellness. Perfect for all fitness levels.',
    content: `The 20-minute yoga timer is ideal for a complete yoga or stretching session that improves flexibility, reduces tension, and promotes relaxation. Twenty minutes provides enough time for proper warm-up, holding key poses, and cool-down stretching. Regular yoga practice increases flexibility, improves posture, reduces stress, and enhances overall wellbeing. Whether you're an experienced practitioner or beginner, the 20-minute timer creates a sustainable yoga routine that fits modern schedules.`,
    keywords: ['yoga timer', 'stretching timer', '20 minute yoga', 'flexibility timer', 'wellness timer', 'yoga session timer', 'relaxation timer'],
    uses: ['Yoga practice', 'Stretching routine', 'Flexibility training', 'Stress relief', 'Recovery routine'],
    category: 'wellness',
    whySection: `Yoga and stretching require sufficient time to properly warm muscles, hold poses safely, and complete adequate cool-down. Twenty minutes provides this ideal duration: 3-5 minutes warm-up, 12-15 minutes for active poses and stretching, 2-3 minutes cool-down and final relaxation. Regular 20-minute yoga sessions significantly improve flexibility, reduce muscle tension, improve posture, and reduce stress. The sustained practice also improves body awareness and mind-body connection, delivering mental and physical benefits.`,
    howToSection: `Begin your yoga session by clicking "Start." Start with gentle warm-up movements for 3-5 minutes to prepare muscles and joints. Move through yoga poses or stretching sequences, holding each stretch for 20-30 seconds. Focus on steady breathing throughout. If you're new to yoga, follow beginner sequences emphasizing foundational poses. End with 2-3 minutes of cool-down stretching and relaxation. The timer helps pace your session appropriately.`,
    tipsSection: [
      'Never force stretches—yoga is about gentle, sustained movement, not pain',
      'Focus on consistent breathing throughout your practice',
      'Practice yoga at the same time daily to build habit and maximize benefits',
      'Use online yoga videos to guide your 20-minute session',
      'Start with beginner sequences, gradually increasing difficulty',
      'Practice in comfortable clothes with a yoga mat or towel',
      'Yoga provides best benefits when practiced 4-5 times per week',
    ],
    faqSection: [
      {
        question: 'Is 20 minutes enough for an effective yoga practice?',
        answer: 'Yes. Twenty minutes is perfect for sustainable daily practice. Research shows that daily 20-minute yoga significantly improves flexibility and reduces stress.',
      },
      {
        question: 'Can beginners do yoga with the 20-minute timer?',
        answer: 'Absolutely. Start with beginner sequences. Focus on proper form rather than advanced poses. Your body will strengthen and become more flexible quickly.',
      },
      {
        question: 'How often should I practice yoga?',
        answer: 'Daily is ideal for maximum benefits. Even 4-5 times per week provides significant improvements in flexibility, strength, and stress relief.',
      },
      {
        question: 'Do I need equipment for a yoga session?',
        answer: 'A yoga mat is helpful but not essential. You can practice on carpet or a towel. Comfortable, flexible clothing is important.',
      },
      {
        question: 'What are the benefits of regular yoga practice?',
        answer: 'Regular yoga improves flexibility, builds strength, enhances balance, reduces stress and anxiety, improves posture, and promotes overall wellbeing.',
      },
    ],
    relatedTimers: ['15-minute-timer', '10-minute-timer', '30-minute-timer', '10-minute-meditation-timer'],
  },
  {
    duration: 1200,
    slug: '20-minute-mindfulness-timer',
    title: 'Free 20 Minute Mindfulness Timer - Corporate Wellness',
    description: 'Extended 20-minute mindfulness break timer for workplace stress management, mental health, and corporate wellness programs. Perfect for busy professionals.',
    content: `The 20-minute mindfulness timer is designed for comprehensive mindfulness and wellness breaks in corporate environments. Twenty minutes provides sufficient time to meaningfully reduce stress and center the mind. For busy professionals, the 20-minute timer offers a substantial break that actually restores mental resources without consuming excessive time. Regular mindfulness practice improves focus, reduces burnout, enhances emotional intelligence, and improves overall workplace wellbeing.`,
    keywords: ['20 minute mindfulness', 'mindfulness timer', 'wellness break timer', 'corporate wellness', 'stress management timer', 'mindfulness meditation', 'workplace wellness'],
    uses: ['Mindfulness practice', 'Stress relief', 'Mental wellness', 'Workplace breaks', 'Self-care routine'],
    category: 'wellness',
    whySection: `A 20-minute mindfulness break provides meaningful stress reduction and mental restoration. Research shows that 20-minute mindfulness sessions significantly reduce anxiety, improve focus, and enhance emotional regulation. For workplace wellness, 20-minute mindfulness breaks are ideal because they provide substantial mental health benefits while fitting within work schedules. Regular mindfulness practice rewires the brain for improved attention, emotional stability, and resilience against workplace stress.`,
    howToSection: `Find a quiet space or use a quiet corner of your workplace. Click "Start" and settle into a comfortable position. Begin with gentle breathing awareness for 1-2 minutes. Then practice body scan meditation, observing sensations throughout your body without judgment. Alternatively, follow guided mindfulness content designed for 20 minutes. The goal is present-moment awareness without judgment. When the timer sounds, you'll feel refreshed and more centered.`,
    tipsSection: [
      'Schedule 20-minute mindfulness breaks at consistent times for habit formation',
      'Use workplace mindfulness apps for guided 20-minute sessions',
      'Encourage team mindfulness breaks—group practice builds culture change',
      'Combine with breaks from screens for maximum benefit',
      'Practice in the same quiet location to deepen the practice',
      'Keep eyes closed if possible for deeper focus',
      'Even one 20-minute session significantly improves mood and focus',
    ],
    faqSection: [
      {
        question: 'What is the difference between mindfulness and meditation?',
        answer: 'Meditation is a formal practice. Mindfulness is present-moment awareness in daily life. A 20-minute mindfulness timer can include both meditation and mindfulness practice.',
      },
      {
        question: 'Can I practice mindfulness at work?',
        answer: 'Yes. Find a quiet space—your office, an empty conference room, or outdoor area. Even 20 minutes of workplace mindfulness significantly improves stress and focus.',
      },
      {
        question: 'How does mindfulness improve workplace productivity?',
        answer: 'Mindfulness reduces stress, improves focus, enhances emotional regulation, and reduces reactivity—all directly improving workplace performance and decision-making.',
      },
      {
        question: 'Should I practice mindfulness daily?',
        answer: 'Yes. Daily 20-minute mindfulness produces best results. Even one session weekly provides benefits, but consistency maximizes impact.',
      },
      {
        question: 'Is 20 minutes enough for mindfulness benefits?',
        answer: 'Yes. Research shows 20 minutes of daily mindfulness significantly reduces anxiety and improves focus within 2-4 weeks of consistent practice.',
      },
    ],
    relatedTimers: ['15-minute-timer', '10-minute-meditation-timer', '30-minute-timer', '25-minute-timer'],
  },
  {
    duration: 900,
    slug: 'cooking-timer',
    title: 'Free Cooking Timer - Kitchen Timer & Recipe Timer',
    description: 'Essential cooking timer for meal preparation, recipe timing, and kitchen management. Perfect for home cooks and meal planners cooking healthy meals.',
    content: `The cooking timer is an essential tool for successful meal preparation. Perfect timing is crucial for cooking quality meals—whether you're boiling pasta, baking, sautéing vegetables, or preparing complete recipes. The 15-minute (900 second) timer is ideal for timing quick recipes and individual components. Many recipes include 10-15 minute cooking steps, making this timer perfect for everyday cooking. Whether you're meal planning for the week or preparing daily dinner, the cooking timer ensures perfectly timed results every time.`,
    keywords: ['cooking timer', 'kitchen timer', 'recipe timer', 'meal prep timer', 'food timer', '15 minute timer', 'online timer'],
    uses: ['Cooking recipes', 'Meal preparation', 'Baking timer', 'Boiling pasta', 'Ingredient timing'],
    category: 'lifestyle',
    whySection: `Proper timing is crucial for cooking quality. Under-cooking leads to food safety issues; over-cooking reduces quality and nutrition. Many cooking steps require precise timing: pasta (8-12 minutes), vegetables (5-15 minutes), proteins (vary by type), and baking (temperature and time critical). The 15-minute cooking timer covers most individual cooking steps in recipes. Using a timer removes guesswork and improves cooking consistency, helping you master recipes and develop better cooking skills.`,
    howToSection: `When starting a cooking step that requires timing, click "Start" on the timer. Place the timer visibly in your kitchen. You can continue with other food preparation while the timer counts down—no need to watch it. The timer will alert you when the time is complete, allowing you to check on your food at the precise moment. This prevents overcooking and ensures optimal results. For recipes with multiple timed steps, use the timer for each step sequentially.`,
    tipsSection: [
      'Set timer immediately when food goes in heat—don\'t rely on memory',
      'For multi-step recipes, use the timer for each timed step',
      'Prepare additional ingredients while waiting for the timer',
      'Check food at the timer alert—don\'t continue beyond the time',
      'Adjust timing slightly based on your specific stove and oven calibration',
      'Keep the timer in a visible location so you don\'t miss the alert',
      'Use for both stovetop cooking and oven baking',
    ],
    faqSection: [
      {
        question: 'What cooking steps need the 15-minute timer?',
        answer: 'Boiling pasta, cooking rice, steaming vegetables, sautéing proteins, and many baking steps. Most individual recipe components fit within 15 minutes.',
      },
      {
        question: 'Is the timer accurate for cooking?',
        answer: 'Yes, our timer is precise to the second. Cooking accuracy depends on starting the timer at the right moment and checking food when the timer sounds.',
      },
      {
        question: 'Can I set the timer before ingredients are ready?',
        answer: 'You can start the timer early, but ideal is to start it exactly when food enters heat for most accurate cooking results.',
      },
      {
        question: 'What if my cooking step takes longer than 15 minutes?',
        answer: 'You can restart the timer. Most individual cooking steps fit within 15 minutes, but complex recipes may need sequential timers.',
      },
      {
        question: 'How does using a timer improve cooking?',
        answer: 'Precise timing prevents overcooking, ensures consistent results, reduces food waste, and helps you master recipes faster through consistent practice.',
      },
    ],
    relatedTimers: ['10-minute-timer', '20-minute-timer', '30-minute-timer', '5-minute-timer'],
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

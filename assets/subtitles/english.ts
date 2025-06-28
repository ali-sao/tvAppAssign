// Base 1-minute template
const baseEnglishTemplate = [
  { start: 2, end: 5, text: "Welcome to our streaming platform" },
  { start: 5.5, end: 8.5, text: "Enjoy high-quality entertainment" },
  { start: 9, end: 12, text: "With crystal clear video and audio" },
  { start: 12.5, end: 15.5, text: "Available in multiple languages" },
  { start: 16, end: 19, text: "Stream anywhere, anytime" },
  { start: 19.5, end: 22.5, text: "On any device you prefer" },
  { start: 23, end: 26, text: "Discover thousands of movies" },
  { start: 26.5, end: 29.5, text: "And TV shows from around the world" },
  { start: 30, end: 33, text: "Create your personal watchlist" },
  { start: 33.5, end: 36.5, text: "Resume watching where you left off" },
  { start: 37, end: 40, text: "Experience entertainment like never before" },
  { start: 40.5, end: 43.5, text: "With our advanced streaming technology" },
  { start: 44, end: 47, text: "Join millions of satisfied viewers" },
  { start: 47.5, end: 50.5, text: "Start your journey today" },
  { start: 51, end: 54, text: "Subscribe now for unlimited access" },
  { start: 54.5, end: 57.5, text: "Thank you for choosing our platform" },
  { start: 58, end: 60, text: "Enjoy your viewing experience!" }
];

// Helper function to format time
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

// Generator function to create 10 minutes of subtitles
const generateEnglishVTT = (): string => {
  let vttContent = 'WEBVTT\n\n';
  
  // Repeat the template 10 times (10 minutes)
  for (let minute = 0; minute < 10; minute++) {
    const minuteOffset = minute * 60; // 60 seconds per minute
    
    baseEnglishTemplate.forEach(cue => {
      const startTime = formatTime(cue.start + minuteOffset);
      const endTime = formatTime(cue.end + minuteOffset);
      const text = minute === 0 ? cue.text : `${cue.text} (${minute + 1})`;
      
      vttContent += `${startTime} --> ${endTime}\n${text}\n\n`;
    });
  }
  
  return vttContent.trim();
};

export const englishVTT = generateEnglishVTT(); 
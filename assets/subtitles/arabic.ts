// Base 1-minute template
const baseArabicTemplate = [
  { start: 2, end: 5, text: "أهلاً بكم في منصتنا للبث" },
  { start: 5.5, end: 8.5, text: "استمتعوا بترفيه عالي الجودة" },
  { start: 9, end: 12, text: "مع فيديو وصوت واضح تماماً" },
  { start: 12.5, end: 15.5, text: "متوفر بلغات متعددة" },
  { start: 16, end: 19, text: "شاهدوا في أي مكان وأي وقت" },
  { start: 19.5, end: 22.5, text: "على أي جهاز تفضلونه" },
  { start: 23, end: 26, text: "اكتشفوا آلاف الأفلام" },
  { start: 26.5, end: 29.5, text: "والمسلسلات من حول العالم" },
  { start: 30, end: 33, text: "أنشئوا قائمة المشاهدة الخاصة بكم" },
  { start: 33.5, end: 36.5, text: "واصلوا المشاهدة من حيث توقفتم" },
  { start: 37, end: 40, text: "اختبروا الترفيه كما لم تختبروه من قبل" },
  { start: 40.5, end: 43.5, text: "مع تقنية البث المتقدمة لدينا" },
  { start: 44, end: 47, text: "انضموا لملايين المشاهدين الراضين" },
  { start: 47.5, end: 50.5, text: "ابدأوا رحلتكم اليوم" },
  { start: 51, end: 54, text: "اشتركوا الآن للوصول اللامحدود" },
  { start: 54.5, end: 57.5, text: "شكراً لاختياركم منصتنا" },
  { start: 58, end: 60, text: "استمتعوا بتجربة المشاهدة!" }
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
const generateArabicVTT = (): string => {
  let vttContent = 'WEBVTT\n\n';
  
  // Repeat the template 10 times (10 minutes)
  for (let minute = 0; minute < 10; minute++) {
    const minuteOffset = minute * 60; // 60 seconds per minute
    
    baseArabicTemplate.forEach(cue => {
      const startTime = formatTime(cue.start + minuteOffset);
      const endTime = formatTime(cue.end + minuteOffset);
      const text = minute === 0 ? cue.text : `${cue.text} (${minute + 1})`;
      
      vttContent += `${startTime} --> ${endTime}\n${text}\n\n`;
    });
  }
  
  return vttContent.trim();
};

export const arabicVTT = generateArabicVTT(); 
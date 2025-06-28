export interface VTTCue {
  start: number;
  end: number;
  text: string;
}

/**
 * Parse VTT time format (HH:MM:SS.mmm or HH:MM:SS,mmm) to seconds
 */
export const parseVTTTime = (timeString: string): number => {
  const parts = timeString.replace(',', '.').split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Parse WebVTT file content into subtitle cues
 */
export const parseVTT = (vttContent: string): VTTCue[] => {
  const cues: VTTCue[] = [];
  const lines = vttContent.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip WEBVTT header and empty lines
    if (line === 'WEBVTT' || line === '' || line.startsWith('NOTE')) {
      i++;
      continue;
    }
    
    // Check if this line contains timing information
    if (line.includes('-->')) {
      const timingMatch = line.match(/(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/);
      if (timingMatch) {
        const startTime = parseVTTTime(timingMatch[1]);
        const endTime = parseVTTTime(timingMatch[2]);
        
        // Collect subtitle text from following lines
        i++;
        let text = '';
        while (i < lines.length && lines[i].trim() !== '') {
          if (text) text += '\n';
          text += lines[i].trim();
          i++;
        }
        
        if (text) {
          cues.push({
            start: startTime,
            end: endTime,
            text: text.replace(/<[^>]*>/g, '') // Remove HTML tags
          });
        }
      }
    }
    i++;
  }
  
  return cues;
};

/**
 * Load and parse a VTT file from URL or data URL
 */
export const loadVTTFile = async (url: string): Promise<VTTCue[]> => {
  try {
    console.log(`📝 Loading VTT file from: ${url.substring(0, 100)}...`);
    
    let vttContent: string;
    
    // Handle data URLs directly
    if (url.startsWith('data:text/vtt')) {
      const base64Match = url.match(/^data:text\/vtt;charset=utf-8,(.+)$/);
      if (base64Match) {
        vttContent = decodeURIComponent(base64Match[1]);
        console.log('📝 Parsed data URL successfully');
      } else {
        throw new Error('Invalid data URL format');
      }
    } else {
      // Handle regular HTTP URLs
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      vttContent = await response.text();
    }
    
    const cues = parseVTT(vttContent);
    
    console.log(`📝 Loaded ${cues.length} subtitle cues`);
    console.log(`📝 First few lines of VTT content:`, vttContent.split('\n').slice(0, 5));
    if (cues.length > 0) {
      console.log(`📝 First cue:`, cues[0]);
    }
    return cues;
  } catch (error) {
    console.error('📝 Failed to load VTT file:', error);
    throw error;
  }
};

/**
 * Find the current subtitle cue based on playback time
 */
export const getCurrentSubtitle = (cues: VTTCue[], currentTime: number): string | null => {
  const currentCue = cues.find(
    cue => currentTime >= cue.start && currentTime <= cue.end
  );
  return currentCue ? currentCue.text : null;
}; 
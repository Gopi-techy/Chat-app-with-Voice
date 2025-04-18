// Text to Speech with enhanced functionality

const synth = window.speechSynthesis;
let currentUtterance = null;

// Main text-to-speech function
const textToSpeech = (string) => {
  try {
    // Cancel any ongoing speech
    if (synth.speaking) {
      synth.cancel();
    }
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(string);
    currentUtterance = utterance;
    
    // Configure speech properties
    utterance.text = string;
    utterance.lang = "en-US";
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    // Get available voices and set a preferred one
    let voices = synth.getVoices();
    if (voices.length > 0) {
      // Try to find a female English voice first
      let voice = voices.find(voice => voice.name.includes('Female') && voice.lang.includes('en'));
      // If not found, find any English voice
      if (!voice) {
        voice = voices.find(voice => voice.lang.includes('en'));
      }
      // If still not found, use the first available voice
      utterance.voice = voice || voices[0];
    }
    
    // Add event listeners for monitoring speech state
    utterance.onstart = () => {
      console.log("Speech started");
    };
    
    utterance.onend = () => {
      console.log("Speech ended");
      currentUtterance = null;
    };
    
    utterance.onerror = (event) => {
      console.error("Speech error:", event.error);
      currentUtterance = null;
    };
    
    // Speak the text
    synth.speak(utterance);
    
  } catch (error) {
    console.error("Text to speech error:", error);
  }
};

// Function to stop speech
const stopSpeech = () => {
  if (synth.speaking) {
    synth.cancel();
    currentUtterance = null;
  }
};

// Function to check if speech is in progress
const isSpeaking = () => {
  return synth.speaking;
};

// Initialize voices when they're loaded (needed for some browsers)
if ('onvoiceschanged' in synth) {
  synth.onvoiceschanged = () => {
    console.log("Voices loaded:", synth.getVoices().length);
  };
}
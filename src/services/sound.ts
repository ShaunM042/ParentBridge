import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

// Define sound types
export const notificationSounds = {
  attendance: new Sound('notification_attendance.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.error('Failed to load attendance sound', error);
    }
  }),
  grade: new Sound('notification_grade.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.error('Failed to load grade sound', error);
    }
  }),
  message: new Sound('notification_message.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.error('Failed to load message sound', error);
    }
  }),
  event: new Sound('notification_event.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.error('Failed to load event sound', error);
    }
  }),
};

export const playNotificationSound = (type: keyof typeof notificationSounds) => {
  const sound = notificationSounds[type];
  
  // Stop any currently playing sound
  sound.stop(() => {
    // Play the new sound
    sound.play(success => {
      if (!success) {
        console.error('Failed to play notification sound');
      }
    });
  });
};

export const setNotificationVolume = (volume: number) => {
  Object.values(notificationSounds).forEach(sound => {
    sound.setVolume(volume);
  });
};

export const releaseSounds = () => {
  Object.values(notificationSounds).forEach(sound => {
    sound.release();
  });
}; 
import { AccessibilityInfo, findNodeHandle } from 'react-native';

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  fontSize: number;
  highContrast: boolean;
  reduceMotion: boolean;
  colorBlindMode: boolean;
  voiceOverEnabled: boolean;
}

export const getAccessibilitySettings = async (): Promise<AccessibilitySettings> => {
  const [screenReaderEnabled, reduceMotion] = await Promise.all([
    AccessibilityInfo.isScreenReaderEnabled(),
    AccessibilityInfo.isReduceMotionEnabled(),
  ]);

  return {
    screenReaderEnabled,
    fontSize: 16, // Default font size
    highContrast: false,
    reduceMotion,
    colorBlindMode: false,
    voiceOverEnabled: screenReaderEnabled,
  };
};

export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

export const setAccessibilityFocus = (ref: React.RefObject<any>): void => {
  const node = findNodeHandle(ref.current);
  if (node) {
    AccessibilityInfo.setAccessibilityFocus(node);
  }
};

export const generateAccessibilityLabel = (
  label: string,
  hint?: string,
  role?: string
): { accessible: boolean; accessibilityLabel: string; accessibilityHint?: string; accessibilityRole?: string } => {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
  };
};

export const getAccessibilityStyles = (
  settings: AccessibilitySettings
): {
  fontSize: number;
  color: string;
  backgroundColor: string;
} => {
  return {
    fontSize: settings.fontSize,
    color: settings.highContrast ? '#000' : '#333',
    backgroundColor: settings.highContrast ? '#fff' : '#f5f5f5',
  };
};

export const isAccessibilityEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

export const subscribeToAccessibilityChanges = (
  callback: (enabled: boolean) => void
): () => void => {
  const subscription = AccessibilityInfo.addEventListener(
    'screenReaderChanged',
    callback
  );

  return () => {
    subscription.remove();
  };
}; 
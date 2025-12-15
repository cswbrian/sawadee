// Settings storage utilities
const SETTINGS_KEY = "sawadee_settings_v1";

export type QuizSelectionMap = Record<string, string[]>; // quizType -> array of selected group keys

export interface Settings {
  adaptiveLearning: boolean;
  quizSelections: QuizSelectionMap; // Store selected groups per quiz type
  // Future settings can be added here
}

const defaultSettings: Settings = {
  adaptiveLearning: true,
  quizSelections: {},
};

export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle future settings
      return { 
        ...defaultSettings, 
        ...parsed,
        // Ensure nested objects are merged correctly
        quizSelections: { ...defaultSettings.quizSelections, ...parsed.quizSelections }
      };
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const updateSetting = <K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Settings => {
  const current = loadSettings();
  const updated = { ...current, [key]: value };
  saveSettings(updated);
  return updated;
};

export const saveQuizSelection = (quizType: string, selectedGroups: string[]) => {
  const settings = loadSettings();
  const newSelections = {
    ...settings.quizSelections,
    [quizType]: selectedGroups
  };
  updateSetting("quizSelections", newSelections);
};

export const getQuizSelection = (quizType: string): string[] | null => {
  const settings = loadSettings();
  return settings.quizSelections[quizType] || null;
};


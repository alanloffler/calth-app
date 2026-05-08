export interface IRecurrentDay {
  available: boolean;
  date: string;
}

export interface IRecurrentDayResponse {
  dates: IRecurrentDay[];
  suggestions: IRecurrentSuggestion;
}

interface IRecurrentSuggestion {
  sameDay: string[];
  otherDaysSameHour: string[];
  otherDaysAnyHour: string[];
}

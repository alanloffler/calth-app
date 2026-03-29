export interface IRecurrentDay {
  available: boolean;
  date: string;
}

export interface IRecurrentDayResponse {
  dates: IRecurrentDay[];
  suggestion: string;
}

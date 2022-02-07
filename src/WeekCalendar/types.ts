export enum CalendarView {
  Day,
  Days3,
  WorkWeek,
  Week,
  Month
}

export interface CalendarEvent<TData = unknown> {
  id: string;
  title: string;
  startDate?: Date;
  endDate?: Date;
  startDateTime?: Date;
  endDateTime?: Date;
  data: TData;
}

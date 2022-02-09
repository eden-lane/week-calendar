import React from "react";
import styled from "styled-components";
import { CalendarEvent, CalendarView } from "./types";
import { MonthView } from "./views/MonthView";
import { DayView } from "./views/DayView";

type Props<TData> = {
  range: Interval;
  view: CalendarView;
  events: CalendarEvent<TData>[];
};

export const WeekCalendar = <TData extends unknown>(props: Props<TData>) => {
  const { view, events, range } = props;

  switch (view) {
    case CalendarView.Day:
    case CalendarView.Days3:
    case CalendarView.Week:
      return (
        <Root>
          <DayView range={range} events={events} />
        </Root>
      );
    case CalendarView.Month:
      return (
        <Root>
          <MonthView range={range} events={events} />
        </Root>
      );
    default:
      throw new Error("This view is not implemented yet");
  }
};

const Root = styled.main`
  border: 1px solid #ccc;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

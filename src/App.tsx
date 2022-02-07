import { endOfMonth, startOfMonth } from "date-fns";
import styled from "styled-components";
import { CalendarEvent, CalendarView } from "./WeekCalendar/types";
import { WeekCalendar } from "./WeekCalendar/WeekCalendar";

console.clear();

const events: CalendarEvent[] = [];

export default function App() {
  return (
    <Root>
      <WeekCalendar
        view={CalendarView.Month}
        events={events}
        range={{ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }}
      />
    </Root>
  );
}

const Root = styled.div`
  height: 500px;
`;

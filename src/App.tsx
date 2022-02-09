import { createGlobalStyle } from "styled-components";
import { endOfMonth, startOfMonth } from "date-fns";
import styled from "styled-components";
import { CalendarEvent, CalendarView } from "./WeekCalendar/types";
import { WeekCalendar } from "./WeekCalendar/WeekCalendar";

console.clear();

const events: CalendarEvent[] = [];

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Open Sans';
  }
`;

export default function App() {
  return (
    <Root>
      <GlobalStyle />
      <WeekCalendar
        view={CalendarView.Month}
        events={events}
        range={{ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }}
      />
    </Root>
  );
}

const Root = styled.div`
  height: 700px;
`;

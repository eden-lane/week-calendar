import { createGlobalStyle } from "styled-components";
import { endOfMonth, startOfMonth } from "date-fns";
import styled from "styled-components";
import { CalendarEvent, CalendarView } from "./WeekCalendar/types";
import { WeekCalendar } from "./WeekCalendar/WeekCalendar";
import { Task } from "./types";

console.clear();

const events: CalendarEvent<Task>[] = [
  {
    id: "1",
    title: "New event",
    startDate: new Date(2022, 2, 4),
    endDate: new Date(2022, 2, 5),
    data: {
      background: "#03a9f4",
      color: "#fff"
    }
  },
  {
    id: "2",
    title: "Vacation",
    startDate: new Date(2022, 2, 15),
    endDate: new Date(2022, 2, 21),
    data: {
      background: "#cddc39",
      color: "#000"
    }
  }
];

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Open Sans';
  }
`;

export default function App() {
  return (
    <Root>
      <GlobalStyle />
      <WeekCalendar<Task>
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

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
    endDate: new Date(2022, 2, 25),
    data: {
      background: "#cddc39",
      color: "#000"
    }
  },
  {
    id: "3",
    title: "Work",
    startDate: new Date(2022, 2, 12),
    endDate: new Date(2022, 2, 22)
  },
  {
    id: "4",
    title: "Day off",
    startDate: new Date(2022, 2, 13),
    endDate: new Date(2022, 2, 13)
  },
  {
    id: "5",
    title: "Task",
    startDate: new Date(2022, 2, 23),
    endDate: new Date(2022, 2, 23)
  },
  {
    id: "6",
    title: "Task 2",
    startDateTime: new Date(2022, 0, 26, 5),
    endDateTime: new Date(2022, 0, 26, 7)
  },
  {
    id: "7",
    title: "Task 3",
    startDateTime: new Date(2022, 0, 26, 4),
    endDateTime: new Date(2022, 0, 26, 8)
  },
  {
    id: "8",
    title: "Task 4",
    startDateTime: new Date(2022, 0, 26, 6),
    endDateTime: new Date(2022, 0, 26, 8)
  }
];

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Open Sans';
    box-sizing: border-box;
  }
`;

export default function App() {
  return (
    <Root>
      <GlobalStyle />
      <WeekCalendar<Task>
        view={CalendarView.Week}
        events={events}
        range={{ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }}
      />
    </Root>
  );
}

const Root = styled.div`
  height: 700px;
`;

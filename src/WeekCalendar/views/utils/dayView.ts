import { differenceInMinutes, startOfDay } from "date-fns";
import { CalendarEvent } from "../../types";

type Position = {
  top: number;
  height: number;
};

type GetPositionOFEventOptions = {
  startTime: Date;
  endTime: Date;
  hourHeight: number;
};

export const getPositionOfEvent = (
  event: CalendarEvent,
  opts: GetPositionOFEventOptions
): Position => {
  const { startTime, endTime, hourHeight } = opts;

  const diffMinsFromStart = differenceInMinutes(
    startTime,
    startOfDay(startTime)
  );

  const minuteHeight = hourHeight / 60;
  const minutes = differenceInMinutes(event.endDateTime, event.startDateTime);

  return {
    top:
      differenceInMinutes(
        event.startDateTime,
        startOfDay(event.startDateTime)
      ) *
        minuteHeight -
      diffMinsFromStart * minuteHeight,
    height: minutes * minuteHeight
  };
};

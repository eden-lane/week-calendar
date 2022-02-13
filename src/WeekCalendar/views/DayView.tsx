import {
  sub,
  add,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfDay,
  startOfDay,
  format,
  startOfToday,
  endOfToday,
  areIntervalsOverlapping,
  startOfWeek,
  isSameDay
} from "date-fns";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import styled from "styled-components";
import { useVirtualized } from "../hooks/useVirtualized";
import { getPositionOfEvent } from "./utils/dayView";
import { CalendarEvent } from "../types";

type EventData<TData = unknown> = {
  offset: number;
  width: number;
  event: CalendarEvent<TData>;
  overlaps: EventData<TData>[];
};

type Props = {
  range: Interval;
  events: CalendarEvent[];
  daysCount: number;
};

const HOUR_HEIGHT = 100;
const HEADER_HEIGHT = 50;
const ASIDE_WIDTH = 60;
const REMOVE_ITEMS_COUNT = 10;
const DATE_FORMAT = "dd.MM.yyyy";

export const DayView = (props: Props) => {
  const { range, events, daysCount } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Date[]>([]);
  const [width, setWidth] = useState(-1);
  const [date, setDate] = useState(range.start);
  const direction = useRef(0);
  const itemsDiff = useRef(-1);
  const scrollPosition = useRef(-1);
  const scrollTimeout = useRef<number>();
  const [isFirstRender, setFirstRender] = useState(true);

  const eventsMap = useMemo<Map<string, EventData[]>>(() => {
    const result = new Map<string, EventData[]>();

    events
      .sort((b, a) => {
        return (
          (a.startDate?.getTime() || a.startDateTime!.getTime()) -
          (b.startDate?.getTime() || b.startDateTime!.getTime())
        );
      })
      .forEach((event) => {
        if (event.startDateTime && event.endDateTime) {
          const days = eachDayOfInterval({
            start: event.startDateTime,
            end: event.endDateTime
          });

          days.forEach((day, index) => {
            const key = format(day, DATE_FORMAT);
            const l = days.length;
            let startDateTime;
            let endDateTime;

            if (index === 0) {
              startDateTime = event.startDateTime;
            } else {
              startDateTime = startOfDay(day);
            }

            if (index === l - 1) {
              endDateTime = event.endDateTime;
            } else {
              endDateTime = endOfDay(day);
            }

            const dateEvents = result.get(key) || [];
            dateEvents.push({
              event: {
                ...event,
                startDateTime,
                endDateTime
              },
              offset: 0,
              width: 1,
              overlaps: []
            });

            result.set(key, dateEvents);
          });
        }
      });

    // Filling up array of overlapping events
    result.forEach((day) => {
      day.forEach((mainEventData) => {
        const mainEventInterval = {
          start: mainEventData.event.startDateTime!,
          end: mainEventData.event.endDateTime!
        };

        day.forEach((eventData) => {
          if (mainEventData === eventData) {
            return;
          }

          const eventInterval = {
            start: eventData.event.startDateTime!,
            end: eventData.event.endDateTime!
          };

          if (areIntervalsOverlapping(mainEventInterval, eventInterval)) {
            mainEventData.overlaps.push(eventData);
          }
        });
      });
    });

    // Setting up width
    result.forEach((day) => {
      day.forEach((mainEventData) => {
        let count = 1;
        let offset = 0;

        mainEventData.overlaps
          .sort((a, b) => a.offset - b.offset)
          .forEach((item: EventData) => {
            if (item.offset === offset || offset === -1) {
              offset++;
            }
          });

        if (mainEventData.event.title === "Task 5") {
          console.log(
            mainEventData.overlaps
              .sort((a, b) => a.offset - b.offset)
              .map((d) => `${d.event.title} - ${d.offset}`)
              .join(", ")
          );
        }

        mainEventData.overlaps.forEach((eventData) => {
          const eventInterval = {
            start: eventData.event.startDateTime!,
            end: eventData.event.endDateTime!
          };

          const overlappingItems = eventData.overlaps.filter((overlapData) => {
            const overlapInterval = {
              start: overlapData.event.startDateTime!,
              end: overlapData.event.endDateTime!
            };

            const areOverlapping = areIntervalsOverlapping(
              eventInterval,
              overlapInterval
            );

            return areOverlapping;
          });

          count = Math.max(count, overlappingItems.length);
        });

        mainEventData.width = Math.min(1 / count, 1 / (offset + 1));
        mainEventData.offset = offset;
      });
    });

    result.forEach((day) => {
      day.forEach((dataEvent) => {
        console.log(dataEvent.event.title, dataEvent.width, dataEvent.offset);
      });
    });

    console.log(result);

    return result;
  }, [events]);

  useEffect(() => {
    setWidth((rootRef.current?.offsetWidth ?? 0) - ASIDE_WIDTH);
  }, []);

  const renderEvents = (date: Date) => {
    const key = format(date, DATE_FORMAT);
    const events = eventsMap.get(key) || [];

    return events.map((event) => {
      const position = getPositionOfEvent(event.event, {
        startTime: startOfDay(date),
        endTime: endOfDay(date),
        hourHeight: HOUR_HEIGHT
      });

      const eventWidth = (width / daysCount - 10) * event.width;

      return (
        <Event
          data-event
          style={{
            top: position.top,
            height: position.height,
            width: eventWidth,
            left: event.offset * eventWidth
          }}
          key={event.event.id}
        >
          {event.event.title}
        </Event>
      );
    });
  };

  const renderItem = (day: Date, style: { offset: number }) => {
    const hours = eachHourOfInterval({
      start: startOfDay(day),
      end: endOfDay(day)
    });

    return (
      <Day
        key={day.toDateString()}
        style={{
          position: "absolute",
          left: `${style.offset + ASIDE_WIDTH}px`,
          top: `${HEADER_HEIGHT}px`,
          width: `${width / daysCount}px`
        }}
      >
        {renderEvents(day)}
        {hours.map((h) => (
          <Hour key={h} />
        ))}
      </Day>
    );
  };

  const {
    containerStyle,
    visibleItemsRender,
    visibleItems,
    onScroll
  } = useVirtualized<Date>({
    items: days,
    itemSize: width / daysCount,
    windowSize: width,
    offscreenItems: 20,
    renderItem
  });

  const getDays = (range: Interval) => {
    return eachDayOfInterval(range);
  };

  const handleReachLeft = () => {
    const firstDate = days[0];

    const newDays = getDays({
      start: sub(firstDate, { weeks: 1 }),
      end: sub(firstDate, { days: 1 })
    });

    setDays([...newDays, ...days.slice(0, REMOVE_ITEMS_COUNT)]);
    direction.current = -1;
    itemsDiff.current = newDays.length;
  };

  const handleReachRight = () => {
    const lastDate = days[days.length - 1];

    const newDays = getDays({
      start: add(lastDate, { days: 1 }),
      end: add(lastDate, { weeks: 2 })
    });

    direction.current = 1;
    itemsDiff.current = days.length - REMOVE_ITEMS_COUNT;
    scrollPosition.current = contRef.current?.scrollLeft ?? 0;
    setDays([...days.slice(-REMOVE_ITEMS_COUNT), ...newDays]);
  };

  useEffect(() => {
    setDays(
      getDays({
        start: sub(date, { days: 7 }),
        end: add(date, { days: 7 })
      })
    );
  }, []);

  const handleStoppedScrolling = () => {
    contRef.current?.scroll({
      left:
        contRef.current?.scrollLeft -
        (contRef.current?.scrollLeft % (width / daysCount)),
      behavior: "smooth"
    });
  };

  const handleScroll = (ev) => {
    onScroll(ev);
    clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(handleStoppedScrolling, 700);

    direction.current = 0;

    if (days.length === 0) return;

    if (ev.target.scrollLeft <= 0) {
      handleReachLeft();
      return;
    }
    if (ev.target.scrollLeft + ev.target.clientWidth >= ev.target.scrollWidth) {
      handleReachRight();
      return;
    }
  };

  useLayoutEffect(() => {
    if (isFirstRender && visibleItems.length) {
      const fisrtDayIndex = visibleItems.findIndex((d) => {
        return isSameDay(d, startOfWeek(new Date()));
      });

      console.log(fisrtDayIndex);

      contRef.current?.scroll({
        left: (width / daysCount) * fisrtDayIndex
      });
      setFirstRender(false);
    }

    if (direction.current === -1) {
      contRef.current?.scroll({
        left: (itemsDiff.current * width) / daysCount
      });
    } else if (direction.current === 1) {
      contRef.current?.scroll({
        left: scrollPosition.current - itemsDiff.current * (width / daysCount)
      });
    }
  });

  return (
    <>
      <Days ref={rootRef}>
        <Container ref={contRef} onScroll={handleScroll}>
          <Aside width={width / visibleItems.length}>
            <Header></Header>
            {eachHourOfInterval({
              start: startOfToday(),
              end: endOfToday()
            }).map((h) => (
              <AsideHour key={h.getHours()}>
                <AsideHourLabel>{format(h, "HH:mm")}</AsideHourLabel>
              </AsideHour>
            ))}
          </Aside>
          <Header>
            {visibleItems.map((date) => (
              <DateLabel key={date.getTime()} width={width / daysCount}>
                <div>{format(date, "EE")}</div>
                <div>{format(date, "dd, MMM")}</div>
              </DateLabel>
            ))}
          </Header>
          <Content style={{ width: containerStyle.size }}>
            {visibleItemsRender}
          </Content>
        </Container>
      </Days>
    </>
  );
};

const Days = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
`;

const Container = styled.div`
  display: flex;
  position: relative;
  /* white-space: nowrap; */
  flex-grow: 1;
  overflow-x: scroll;
  overflow-y: scroll;
`;

const Header = styled.header`
  height: ${HEADER_HEIGHT}px;

  white-space: nowrap;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1;
`;

const DateLabel = styled.div<{ width: number }>`
  width: ${(p) => p.width}px;
  display: inline-block;
  padding: 1px 5px;
  border-bottom: 1px solid #ccc;
  flex-shrink: 0;

  & div:nth-child(1) {
    font-size: 12px;
  }

  & div:nth-child(2) {
    font-size: 24px;
  }
`;

const Day = styled.div`
  position: relative;
  height: 100%;
  display: inline-block;
  flex-shrink: 0;
`;

const Aside = styled.aside<{ width: number }>`
  width: ${(p) => p.width}px;
  left: 0;
  position: sticky;
  flex: 0 0 ${ASIDE_WIDTH}px;

  z-index: 2;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Hour = styled.div`
  width: 100%;
  height: ${HOUR_HEIGHT}px;
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
`;

const AsideHour = styled.div`
  display: flex;
  color: #555;
  justify-content: center;
  font-size: 12px;
  height: ${HOUR_HEIGHT}px;

  border-right: 1px solid #ccc;
  background: #fff;
`;

const AsideHourLabel = styled.span`
  transform: translateY(-10px);
  z-index: 2;
`;

const Event = styled.div`
  position: absolute;
  background: #03a9f4;
  font-size: 12px;
  color: #fff;
  padding: 3px;
  margin: 1px;
  border: 1px solid #fff;
`;

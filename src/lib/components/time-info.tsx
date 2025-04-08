import {
  differenceInHours,
  differenceInMinutes,
  getDay,
  getMonth,
  getYear,
} from "date-fns";

export default function TimeInfo({ createdAt }: { createdAt: Date }) {
  const minsDiff = differenceInMinutes(createdAt, new Date());
  const hrsDiff = differenceInHours(createdAt, new Date());
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const getDiff = () => {
    if (Math.abs(minsDiff) < 60) {
      return `${Math.abs(minsDiff)}m`;
    }
    if (Math.abs(hrsDiff) < 24) {
      return `${Math.abs(hrsDiff)}h`;
    }
    return `${monthNames[getMonth(createdAt)]} ${getDay(createdAt)} ${getYear(createdAt) !== getYear(new Date()) ? getYear(createdAt) : ""} at ${createdAt.toLocaleTimeString()}`;
  };
  return <p className="text-xs text-muted-foreground">{getDiff()}</p>;
}

const urgencyOrder = {
  overdue: 0,
  due_today: 1,
  urgent: 2,
  upcoming: 3,
  later: 4,
  unknown: 5,
};

function normalizedDate(item) {
  return item?.verified && item.normalized_date
    ? item.normalized_date
    : "9999-12-31";
}

export function sortDeadlines(dates) {
  if (!Array.isArray(dates)) return [];
  return dates
    .filter((item) => item?.type === "deadline")
    .slice()
    .sort((left, right) => {
      const urgencyDifference =
        (urgencyOrder[left.urgency] ?? urgencyOrder.unknown) -
        (urgencyOrder[right.urgency] ?? urgencyOrder.unknown);
      if (urgencyDifference !== 0) return urgencyDifference;
      return (
        normalizedDate(left).localeCompare(normalizedDate(right)) ||
        String(left.label ?? "").localeCompare(String(right.label ?? ""))
      );
    });
}

export function sortEventDates(dates) {
  if (!Array.isArray(dates)) return [];
  return dates
    .filter((item) => item?.type === "event")
    .slice()
    .sort(
      (left, right) =>
        normalizedDate(left).localeCompare(normalizedDate(right)) ||
        String(left.label ?? "").localeCompare(String(right.label ?? ""))
    );
}

export function kolkataDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const dateParts = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function isUrgencyStale(calculatedOn, now = new Date()) {
  if (!calculatedOn) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(calculatedOn)) return true;
  return calculatedOn !== kolkataDate(now);
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  isUrgencyStale,
  sortDeadlines,
  sortEventDates,
} from "./deadlineUtils.js";

test("sorts deadlines by urgency, then verified date", () => {
  const dates = [
    { type: "deadline", label: "Later", urgency: "later", verified: true, normalized_date: "2026-12-01" },
    { type: "deadline", label: "Upcoming", urgency: "upcoming", verified: true, normalized_date: "2026-11-24" },
    { type: "event", label: "Exam", urgency: null, verified: true, normalized_date: "2026-11-18" },
    { type: "deadline", label: "Urgent", urgency: "urgent", verified: true, normalized_date: "2026-11-20" },
    { type: "deadline", label: "Due today", urgency: "due_today", verified: true, normalized_date: "2026-11-17" },
    { type: "deadline", label: "Overdue", urgency: "overdue", verified: true, normalized_date: "2026-11-16" },
    { type: "deadline", label: "Unverified", urgency: "unknown", verified: false, normalized_date: null },
  ];

  assert.deepEqual(
    sortDeadlines(dates).map(({ label }) => label),
    ["Overdue", "Due today", "Urgent", "Upcoming", "Later", "Unverified"]
  );
});

test("sorts event dates separately and handles empty date lists", () => {
  const dates = [
    { type: "event", label: "Later", verified: true, normalized_date: "2026-12-01" },
    { type: "informational", label: "Fee notice" },
    { type: "event", label: "Earlier", verified: true, normalized_date: "2026-11-18" },
  ];

  assert.deepEqual(sortEventDates(dates).map(({ label }) => label), ["Earlier", "Later"]);
  assert.deepEqual(sortDeadlines([]), []);
  assert.deepEqual(sortEventDates([]), []);
  assert.deepEqual(sortDeadlines(null), []);
});

test("marks urgency stale at the Asia/Kolkata calendar-day boundary", () => {
  assert.equal(isUrgencyStale("2026-11-17", new Date("2026-11-17T17:59:00Z")), false);
  assert.equal(isUrgencyStale("2026-11-17", new Date("2026-11-17T18:30:00Z")), true);
  assert.equal(isUrgencyStale(null), false);
  assert.equal(isUrgencyStale("invalid"), true);
});

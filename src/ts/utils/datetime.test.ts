import {
    format,
    timeDifference,
} from "./datetime";

describe("datetime", () => {
    test("format", () => {
        expect(format(new Date(2020, 9, 11, 12, 34, 56)))
            .toBe("2020-10-11 12:34");
    });

    test("format_zeroFilled", () => {
        expect(format(new Date(2020, 1, 3, 4, 5, 6)))
            .toBe("2020-02-03 04:05");
    });

    test("timeDifference_secondsAgo", () => {
        expect(timeDifference((new Date(Date.now() - 30 * 1000))))
            .toBe("just now");
    });

    test("timeDifference_secondsAfter", () => {
        expect(timeDifference((new Date(Date.now() + 30 * 1000))))
            .toBe("just now");
    });

    test("timeDifference_minuteAgo", () => {
        expect(timeDifference((new Date(Date.now() - 90 * 1000))))
            .toBe("1 minute ago");
    });

    test("timeDifference_minuteAfter", () => {
        expect(timeDifference((new Date(Date.now() + 90 * 1000))))
            .toBe("1 minute after");
    });

    test("timeDifference_minutesAgo", () => {
        expect(timeDifference((new Date(Date.now() - 3570 * 1000))))
            .toBe("59 minutes ago");
    });

    test("timeDifference_minutesAfter", () => {
        expect(timeDifference((new Date(Date.now() + 3570 * 1000))))
            .toBe("59 minutes after");
    });

    test("timeDifference_hourAgo", () => {
        expect(timeDifference((new Date(Date.now() - 3630 * 1000))))
            .toBe("1 hour ago");
    });

    test("timeDifference_hourAfter", () => {
        expect(timeDifference((new Date(Date.now() + 3630 * 1000))))
            .toBe("1 hour after");
    });

    test("timeDifference_hoursAgo", () => {
        expect(timeDifference((new Date(Date.now() - 86370 * 1000))))
            .toBe("23 hours ago");
    });

    test("timeDifference_hoursAfter", () => {
        expect(timeDifference((new Date(Date.now() + 86370 * 1000))))
            .toBe("23 hours after");
    });

    test("timeDifference_dayAgo", () => {
        expect(timeDifference((new Date(Date.now() - 86430 * 1000))))
            .toBe("1 day ago");
    });

    test("timeDifference_dayAfter", () => {
        expect(timeDifference((new Date(Date.now() + 86430 * 1000))))
            .toBe("1 day after");
    });

    test("timeDifference_daysAgo", () => {
        expect(timeDifference((new Date(Date.now() - 604770 * 1000))))
            .toBe("6 days ago");
    });

    test("timeDifference_daysAfter", () => {
        expect(timeDifference((new Date(Date.now() + 604770 * 1000))))
            .toBe("6 days after");
    });

    test("timeDifference_weekAgo", () => {
        expect(timeDifference((new Date(Date.now() - 604830 * 1000))))
            .toBe("1 week ago");
    });

    test("timeDifference_weekAfter", () => {
        expect(timeDifference((new Date(Date.now() + 604830 * 1000))))
            .toBe("1 week after");
    });

    test("timeDifference_weeksAgo", () => {
        expect(timeDifference((new Date(Date.now() - 2592000 * 1000))))
            .toBe("4 weeks ago");
    });

    test("timeDifference_weeksAfter", () => {
        expect(timeDifference((new Date(Date.now() + 2592000 * 1000))))
            .toBe("4 weeks after");
    });
});

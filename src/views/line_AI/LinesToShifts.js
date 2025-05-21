import moment from "moment";
function lineShifts(line, start, end) {
    let weekdays = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

    // Store events
    const shifts = {
        all: [],
        add(shift, length, start) {
            this.all.push({
                title: `${shift} (${length})`,
                className: 'fc-shift-display',
                allDay: true,
                start: start,

                // Custom attributes
                length: length,
            });
        },
        addRecurring(shift, length, start, end = null, dow = null) {
            this.all.push({
                title: `${shift} (${length})`,
                daysOfWeek: dow ? dow : null,
                className: 'fc-shift-display',
                allDay: true,
                startRecur: start,
                endRecur: end ? end : null,

                // Custom attributes
                length: length,
            });
        },
    }

    if (line.repeat === 'default') {
        // For default pattern rotate through the details
        let d = start.clone();

        // If only one detail just return it
        if (line.details.length === 1) {
            weekdays.forEach((day, dayIndex) => {
                // // If there is a shift, add it
                let length = line.details[0][day + '_length'];
                if (length) shifts.addRecurring(line.details[0][day], length, moment(line.start).format('YYYY-MM-DD'), end, [dayIndex]);
            });
        } else {
            // Loop through each detail and create shifts
            line.details.forEach((detail) => {
                let D = d.clone(); // Clone the start day for this detail

                // Loop through each day of the week and create shifts for the year
                weekdays.forEach((day) => {
                    let S = D.clone(); // Clone the start day for shift
                    // Check if shift exists for this day
                    let length = detail[day + '_length'];

                    if (length) {
                        // Loop through the leave year and add all shifts for this day of week
                        while (S.isSameOrBefore(end, 'day')) {
                            shifts.add(detail[day], length, S.format('YYYY-MM-DD'));
                            S.add(line.details.length, 'weeks');
                        }
                    }
                    D.add(1, 'day'); // Increment the Day for this detail
                });
                d.add(1, 'week'); // Advance one week for each detail
            });
        }
    } else if (line.repeat === 'span') {
        // For date span, create the events for each detail
        line.details.forEach((detail, idx) => {
            // Use detail start date for subsequent row
            let nextDetail = line.details[idx + 1],
                detailEnd = nextDetail ? moment(nextDetail.start) : end.add(1, 'day');

            // Loop through each day of week and add recurring shift until end of detail
            weekdays.forEach((day, dayIndex) => {
                // If there is a shift, add it
                let length = detail[day + '_length'];
                if (length) shifts.addRecurring(detail[day], length, moment(detail.start).format('YYYY-MM-DD'), detailEnd.format('YYYY-MM-DD'), [dayIndex]);
            });
        });
    }

    return shifts.all;
}

export { lineShifts };

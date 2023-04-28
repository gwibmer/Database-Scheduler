import React from 'react';
import { Container, Typography, Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const colors = [
    '#ffcc80',
    '#80b3ff',
    '#cc6872',
    '#a3be8c',
    '#b48ead',
    '#d08770']

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const startHour = 8;
const endHour = 22;
const rowGap = 10;
const gridWidth = 1200; // in pixels
const gridHeight = 1200; // in pixels
const dayWidth = gridWidth / days.length;
const hourHeight = gridHeight / (endHour - startHour);
const labelMargin = 45;


function expandDay(short) {
    var fullDays = [];
    if (short.includes("M"))
        fullDays.push(days[0]);
    if (short.includes("T"))
        fullDays.push(days[1]);
    if (short.includes("W"))
        fullDays.push(days[2]);
    if (short.includes("R"))
        fullDays.push(days[3]);
    if (short.includes("F"))
        fullDays.push(days[4]);
    if (short.includes("S"))
        fullDays.push(days[5]);
    if (short.includes("U"))
        fullDays.push(days[6]);
    // May need to add more days here (Sat and Sun)
    return fullDays;
}

function constructClasses(component, id, color) {
    const meetingClasses = [];
    let asyncClass = null;
    component.slots.forEach((slot, slotIndex) => {
        expandDay(slot.days).forEach((fullDay, dayIndex) => {
            const startSplit = slot.startTime.split(":");
            const endSplit = slot.endTime.split(":");
            meetingClasses.push({
                id: id + '-' + slotIndex.toString() + '-' + dayIndex.toString(),
                name: component.crn,
                building: slot.room,
                day: fullDay,
                startTime: { h: parseInt(startSplit[0]), m: parseInt(startSplit[1])},
                endTime: {h: parseInt(endSplit[0]), m: parseInt(endSplit[1])},
                professor: component.primaryIns,
                courseNumber: component.course,
                color: color});
        });
    });
    if (meetingClasses.length === 0) {
        asyncClass = {
            name: component.crn,
            professor: component.primaryIns,
            courseNumber: component.course
        }
    }
    return {meetingClasses, asyncClass};
}

const classes = [
    { id: 1, name: 'Math', building: 'Building A', day: 'Monday', startTime: { h: 9, m: 15 }, endTime: { h: 10, m: 30 }, professor: 'John Smith', courseNumber: 'MAT101', color: '#ffcc80' },
    { id: 1, name: 'Math', building: 'Building A',day: 'Thursday', startTime: { h: 9, m: 15 }, endTime: { h: 10, m: 30 }, professor: 'John Smith', courseNumber: 'MAT101', color: '#ffcc80' },
    { id: 2, name: 'Discrete Math',building: 'Building B', day: 'Monday', startTime: { h: 13, m: 45 }, endTime: { h: 15, m: 0 }, professor: 'John Smith', courseNumber: 'COT3100', color: '#80b3ff' },
    { id: 2, name: 'Discrete Math', building: 'Building B',day: 'Wednesday', startTime: { h: 13, m: 45 }, endTime: { h: 15, m: 0 }, professor: 'John Smith', courseNumber: 'COT3100', color: '#80b3ff' },
    { id: 2, name: 'Discrete Math', building: 'Building B',day: 'Friday', startTime: { h: 13, m: 45 }, endTime: { h: 15, m: 0 }, professor: 'John Smith', courseNumber: 'COT3100', color: '#80b3ff' },
    { id: 3, name: 'Programming', building: 'Building C',day: 'Tuesday', startTime: { h: 11, m: 0 }, endTime: { h: 12, m: 45 }, professor: 'Jane Doe', courseNumber: 'COP2510', color: '#cc6872' },
    { id: 3, name: 'Programming ',building: 'Building C', day: 'Thursday', startTime: { h: 11, m: 0 }, endTime: { h: 12, m: 45 }, professor: 'Jane Doe', courseNumber: 'COP2510', color: '#cc6872' },
    { id: 4, name: 'OS',building: 'Building D', day: 'Wednesday', startTime: { h: 8, m: 0 }, endTime: { h: 11, m: 45 }, professor: 'Maria Wibmer', courseNumber: 'COP4610', color: '#88ad83' },

    // Add more classes as needed
];


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    appBar: {
        marginBottom: theme.spacing(4),
    },
    title: {
        flexGrow: 1,
    },
    scheduleContainer: {
        position: 'relative',
        top: '50px',
        width: `${gridWidth + labelMargin}px`,
        height: `${gridHeight + labelMargin}px`,
        border: '1px solid black',
    },
    classCard: {
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 0px 10px #ccc',
        fontFamily: 'Arial, sans-serif',

    },
    cardContent: {
        padding: '10px', // Decreased padding
        textAlign: 'center', // Centered text
    },
    courseInfo: {
        fontSize: '1.0rem',
        fontWeight: 'bold',
        color: '#333',
    },
    professorName: {
        fontSize: '0.7rem', // Decreased professor name font size
        color: '#333',
    },
    classTime: {
        fontSize: '0.6rem', // Decreased class time font size
        color: '#333',
    },
    buildingName: {
        fontSize: '0.6rem',
        color: '#333',
    },
    courseCrn: {
        fontSize: '0.6rem',
        color: '#333',
    }
}));

const heightAdjustment = 20; // Adjust this value to increase the height of the boxes

const ClassCard = ({ classItem, top, left, width, height }) => {
    const classes = useStyles();
    const start = `${classItem.startTime.h}:${classItem.startTime.m.toString().padStart(2, '0')}`;
    const end = `${classItem.endTime.h}:${classItem.endTime.m.toString().padStart(2, '0')}`;

    return (
        <Paper
            elevation={3}
            className={classes.classCard}
            style={{
                backgroundColor: classItem.color,
                position: 'absolute',
                top,
                left,
                width,
                height: height + heightAdjustment,
                border: '1px solid #333',
            }}
        >
            <Box className={classes.cardContent}>
                <Typography className={classes.courseInfo}>
                    {classItem.courseNumber}
                </Typography>
                <Typography className={classes.classTime}>
                    {start} - {end}
                </Typography>
                <Typography className={classes.buildingName}>
                    {classItem.building}
                </Typography>
                <Typography className={classes.professorName}>
                    {classItem.professor}
                </Typography>
                <Typography className={classes.courseCrn}>
                    {classItem.name}
                </Typography>
            </Box>

        </Paper>
    );
};





const TimeLabel = ({ time, top, large }) => (
    <Typography
        style={{
            position: 'absolute',
            top: `${top}px`,
            left: '0',
            fontSize: large ? '1rem' : '0.75rem',
            fontWeight: large ? 'bold' : 'normal',
            zIndex: 2, // Add zIndex

        }}
        variant="body1"
    >
        {time}
    </Typography>
);

const ScheduleGrid = () => {
    const classes = useStyles();

    const hourLines = [];
    for (let i = 0; i < endHour - startHour; i++) {
        hourLines.push(
            <div
                key={`hourLine-${i}`}
                style={{
                    position: 'absolute',
                    top: `${i * hourHeight + labelMargin}px`,
                    left: `${labelMargin}px`,
                    width: `${gridWidth}px`,
                    height: '1px',
                    backgroundColor: 'black', // Updated to green
                }}
            />
        );
    }

    const dayLines = [];
    for (let i = 1; i < days.length; i++) {
        dayLines.push(
            <div
                key={`dayLine-${i}`}
                style={{
                    position: 'absolute',
                    top: `${labelMargin}px`,
                    left: `${i * dayWidth + labelMargin}px`,
                    width: '1px',
                    height: `${gridHeight}px`,
                    backgroundColor: 'black',

                }}
            />
        );
    }

    return (
        <>
            {hourLines}
            {dayLines}
        </>
    );
};


const Schedule = (props) => {
    console.log(props);

    const components = props.components;
    let scheduleClasses = [];
    let asyncClasses = [];
    for (let i = 0; i < components.length; i++) {
        let classes = constructClasses(components[i], props.index.toString() + '-' + i.toString(), colors[i % colors.length]);
        scheduleClasses.push(...classes.meetingClasses);
        if (classes.asyncClass != null)
            asyncClasses.push(classes.asyncClass);
    }
    console.log(scheduleClasses);
    
    const classBoxes = scheduleClasses.map((classItem) => {
        const dayIndex = days.indexOf(classItem.day);
        const startTimeInMinutes = classItem.startTime.h * 60 + classItem.startTime.m;
        const endTimeInMinutes = classItem.endTime.h * 60 + classItem.endTime.m;
        const top = ((startTimeInMinutes - startHour * 60) / 60) * hourHeight + 65;
        const left = dayIndex * dayWidth + labelMargin;
        const width = dayWidth;
        const height = ((endTimeInMinutes - startTimeInMinutes) / 60) * hourHeight - 2 * rowGap;

        return (
            <ClassCard
                key={classItem.id}
                classItem={classItem}
                top={top}
                left={left}
                width={width}
                height={height}
            />
        );
    });



    const timeLabels = [];
    const lineComponents = [];
    const labelHeight = hourHeight / 4;
    const hourLabels = endHour - startHour;
    const labelsPerHour = 4;
    const totalLabels = hourLabels * labelsPerHour;
    const lineHeightOffset = 10;

    for (let i = 0; i < totalLabels; i++) {
        const hour = Math.floor(i / labelsPerHour) + startHour;
        const minute = (i % labelsPerHour) * 15;
        const time = `${hour}:${minute.toString().padStart(2, '0')}`;
        const top = (i * labelHeight) + labelMargin;
        const isWholeHour = minute === 0;

        timeLabels.push(<TimeLabel key={`label-${i}`} time={time} top={top} large={isWholeHour} />);

        if (i < totalLabels - 1) {
            lineComponents.push(<div key={`line-${i}`} style={{ position: 'absolute', top: `${top + labelHeight / 2 + lineHeightOffset}px`, left: `${labelMargin}px`, width: `${gridWidth}px`, height: '1px', backgroundColor: 'black' }} />);
        }
    }

    const dayLabels = days.map((day, i) => {
        return (
            <Typography
                key={day}
                style={{
                    position: 'absolute',
                    top: `-40px`, // Change the top value to -40px
                    left: `${i * dayWidth + labelMargin}px`,
                    width: `${dayWidth}px`,
                    textAlign: 'center',
                    backgroundColor: 'green',
                    fontSize: '1rem',
                    color: 'white',
                }}
                variant="h5"
            >
                {day}
            </Typography>
        );
    });

    return (
        <div>
            <div style={{
                position: 'relative',
                top: '65px', // Change the top value to 65px
                width: `${gridWidth + labelMargin}px`,
                height: `${gridHeight + labelMargin}px`,
                border: '2px solid black',
                borderRadius: '10px' }}>
                <ScheduleGrid />
                {timeLabels}
                {lineComponents}
                {classBoxes}
                {dayLabels}
            </div>
            <div>
                <br/><br/><br/><br/>
                <h2>Asynchronous Classes:</h2>
                {
                    asyncClasses.map(value => (
                        <p><b>{value.courseNumber}</b> | {value.professor} | {value.name}</p>
                    ))
                }
            </div>
        </div>
    );

};

export default Schedule;
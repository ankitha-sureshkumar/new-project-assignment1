import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';


const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '300px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    marginTop: '4px',
    marginBottom: '12px',
    borderRadius: '4px',
    border: '1px solid #ccc'
};

const labelStyle = {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
};

const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};

const styles = {
    wrap: {
        display: "flex"
    },
    left: {
        marginRight: "10px"
    },
    main: {
        flexGrow: "1"
    }
};

const Calendar = () => {
    const { user, setUser } = useAuth(); // Access user token from context
    const today = new Date()
    const [calendar, setCalendar] = useState(null);
    const [events, setEvents] = useState([]);
    const [startDate, setStartDate] = useState(today.toISOString());
    const [formVisible, setFormVisible] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState(null);
    const [formData, setFormData] = useState({ person: '', customText: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get('/api/auth/profile', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                // Update formData as before
                setFormData({
                    person: response.data.name,
                    customText: '', // or response.data.description if you have it
                });
                // Update user context with latest role
                setUser(prev => ({
                    ...prev,
                    role: response.data.role,
                }));
            } catch (error) {
                alert('Failed to fetch profile. Please try again.');
            }
        };

        if (user && setUser) fetchProfile();
    }, [user, setUser]);

    const config = {
        viewType: "Week",
        durationBarVisible: false,
        timeRangeSelectedHandling: "Enabled",
        onTimeRangeSelected: async args => {
            /* const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
             calendar.clearSelection();
             if (!modal.result) { return; }
             calendar.events.add({
               start: args.start,
               end: args.end,
               id: DayPilot.guid(),
               text: modal.result
             }); */
            setSelectedTimeRange({ start: args.start, end: args.end });
            setFormVisible(true);
        },
        onEventClick: async args => {
            // Only allow edit for certain roles
            if (user && ["manager"].includes(user.role)) {
                await editEvent(args.e);
            } else {
                alert("You do not have permission to edit events.");
            }
        },
        contextMenu: new DayPilot.Menu({
            items: [
                {
                    text: "Delete",
                    onClick: async args => {
                        calendar.events.remove(args.source);
                    },
                },
                {
                    text: "-"
                },
                {
                    text: "Edit...",
                    onClick: async args => {
                        await editEvent(args.source);
                    }
                }
            ]
        }),
        onBeforeEventRender: args => {
            args.data.areas = [
                {
                    top: 3,
                    right: 3,
                    width: 20,
                    height: 20,
                    symbol: "icons/daypilot.svg#minichevron-down-2",
                    fontColor: "#fff",
                    toolTip: "Show context menu",
                    action: "ContextMenu",
                },
                {
                    top: 3,
                    right: 25,
                    width: 20,
                    height: 20,
                    symbol: "icons/daypilot.svg#x-circle",
                    fontColor: "#fff",
                    action: "None",
                    toolTip: "Delete event",
                    onClick: async args => {
                        calendar.events.remove(args.source);
                    }
                }
            ];

        }
    };

    const editEvent = async (e) => {
        // Only allow certain roles to edit
        if (!user || user.role !== "manager") {
            alert("You do not have permission to edit events.");
            return;
        }
        const modal = await DayPilot.Modal.prompt("Update event text:", e.text());
        if (!modal.result) { return; }
        e.data.text = modal.result;
        calendar.events.update(e);
    };

    useEffect(() => {

        const events = [
            {
                id: 1,
                text: "Event 1",
                start: "2025-10-06T10:30:00",
                end: "2025-10-06T13:00:00",
            },
            {
                id: 2,
                text: "Event 2",
                start: "2025-08-05T09:30:00",
                end: "2025-08-05T11:30:00",
                backColor: "#6aa84f",
            },
            {
                id: 3,
                text: "Event 3",
                start: "2025-08-04T12:00:00",
                end: "2025-08-04T15:00:00",
                backColor: "#f1c232",
            },
            {
                id: 4,
                text: "Event 4",
                start: "2025-08-03T11:30:00",
                end: "2025-08-03T14:30:00",
                backColor: "#cc4125",
            },
        ];
        setEvents(events);
    }, []);

    return (
        <div>
            {formVisible && user && user.role === "manager" && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ marginBottom: '1rem' }}>Create Event</h3>

                        <label style={labelStyle}>
                            Person:
                            <input
                                type="text"
                                value={formData.person}
                                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                                style={inputStyle}
                            />
                        </label>

                        <label style={labelStyle}>
                            Description:
                            <input
                                type="text"
                                value={formData.customText}
                                onChange={(e) => setFormData({ ...formData, customText: e.target.value })}
                                style={inputStyle}
                            />
                        </label>

                        <div style={{ marginTop: '1rem' }}>
                            <button style={buttonStyle} onClick={() => {
                                calendar.events.add({
                                    id: DayPilot.guid(),
                                    text: `${formData.person}: ${formData.customText}`,
                                    start: selectedTimeRange.start,
                                    end: selectedTimeRange.end
                                });
                                setFormVisible(false);
                                setFormData({ person: '', customText: '' });
                            }}>Create</button>

                            <button style={{ ...buttonStyle, marginLeft: '10px', backgroundColor: '#ccc' }}
                                onClick={() => setFormVisible(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.wrap}>
                <div style={styles.left}>
                    <DayPilotNavigator
                        selectMode={"Week"}
                        showMonths={1}
                        skipMonths={1}
                        selectionDay={startDate}
                        onTimeRangeSelected={args => {
                            setStartDate(args.day);
                        }}
                    />
                </div>
                <div style={styles.main}>
                    <DayPilotCalendar
                        {...config}
                        events={events}
                        startDate={startDate}
                        controlRef={setCalendar}
                    />
                </div>


            </div>
        </div>
    );
}

export default Calendar;

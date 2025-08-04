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
    const toUtcISOString = (localDateTimeString) => {
        const localDate = new Date(localDateTimeString);
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        return utcDate.toISOString();
    };

    const { user, setUser } = useAuth(); // Access user token from context
    const today = new Date()
    const [calendar, setCalendar] = useState(null);
    // const [shifts, setshifts] = useState([]);
    const [startDate, setStartDate] = useState(today.toISOString().split("T")[0]);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        person: '',
        start: '',
        end: ''
    });
    const [shifts, setShifts] = useState([]);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({
        id: '',
        person: '',
        start: '',
        end: ''
    });


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get('/api/auth/profile', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                // Update formData as before
                setFormData(prev => ({
                    ...prev,
                    person: response.data.name,
                }));
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
        onEventClick: async args => {
            // Only allow edit for certain roles
            if (user && ["manager"].includes(user.role)) {
                await editShift(args.e);
            } else {
                alert("You do not have permission to edit shifts.");
            }
        },
        contextMenu: new DayPilot.Menu({

            items: [
                {
                    text: "Delete",
                    onClick: async args => {
                        const confirmed = window.confirm("Are you sure you want to delete this shift?");
                        if (!confirmed) return;

                        await deleteShift(args.source.data.id); // call your new deleteShift function
                    },
                },
                {
                    text: "-"
                },
                {
                    text: "Edit...",
                    onClick: async args => {
                        await editShift(args.source);
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
                    toolTip: "Delete shift",
                    onClick: async args => {
                        calendar.shifts.remove(args.source);
                    }
                }
            ];

        }
    };

    const editShift = async (e) => {
        if (!user || user.role !== "manager") {
            alert("You do not have permission to edit shifts.");
            return;
        }

        setEditFormData({
            id: e.data.id,
            person: e.data.text,
            start: e.data.start.slice(0, 16),
            end: e.data.end.slice(0, 16),
        });

        setEditModalVisible(true);
    };



    const deleteShift = async (shiftId) => {
        if (!user || user.role !== "manager") {
            alert("You do not have permission to delete shifts.");
            return;
        }
        try {
            await axiosInstance.delete(`/api/shifts/${shiftId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            fetchShifts(); // Refresh shifts after deletion
        } catch (error) {
            console.error("Failed to delete shift:", error);
            alert('Failed to delete shift. Please try again.');
        }
    };

    const fetchShifts = async () => {
        try {
            const response = await axiosInstance.get('/api/shifts');
            const data = response.data;

            if (!data || data.length === 0) {
                console.log("No shifts found.");
                setShifts([]);
                return;
            }

            const mappedShifts = data.map(ev => {
                // Format to match DayPilot
                return {
                    id: ev._id,
                    text: ev.person || "Untitled Shift",
                    start: ev.start, // remove milliseconds + Z
                    end: ev.end,
                    backColor: "#6aa84f"
                };
            });

            console.log("Mapped Shifts:", mappedShifts); // Check what's being passed
            setShifts(mappedShifts);
        } catch (error) {
            console.error("Failed to fetch shifts:", error);
            setShifts([]);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    return (
        <div>
            {editModalVisible && (
                <div style={overlayStyle}>
                    <div style={{ ...modalStyle, width: '350px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Edit Shift</h3>

                        <label style={labelStyle}>
                            Person:
                            <input
                                type="text"
                                value={editFormData.person}
                                onChange={(e) => setEditFormData({ ...editFormData, person: e.target.value })}
                                style={inputStyle}
                            />
                        </label>

                        <label style={labelStyle}>
                            Start:
                            <input
                                type="datetime-local"
                                value={editFormData.start}
                                onChange={(e) => setEditFormData({ ...editFormData, start: e.target.value })}
                                style={inputStyle}
                            />
                        </label>

                        <label style={labelStyle}>
                            End:
                            <input
                                type="datetime-local"
                                value={editFormData.end}
                                onChange={(e) => setEditFormData({ ...editFormData, end: e.target.value })}
                                style={inputStyle}
                            />
                        </label>

                        <div style={{ marginTop: '1rem' }}>
                            <button
                                style={buttonStyle}
                                onClick={async () => {
                                    if (!editFormData.person || !editFormData.start || !editFormData.end) {
                                        alert("Please fill in all fields.");
                                        return;
                                    }

                                    try {
                                        await axiosInstance.put(`/api/shifts/${editFormData.id}`, {
                                            person: editFormData.person,
                                            start: toUtcISOString(editFormData.start),
                                            end: toUtcISOString(editFormData.end),
                                        }, {
                                            headers: {
                                                Authorization: `Bearer ${user.token}`
                                            }
                                        });

                                        setEditModalVisible(false);
                                        fetchShifts();
                                    } catch (error) {
                                        alert("Failed to update shift.");
                                        console.error(error);
                                    }
                                }}
                            >
                                Update
                            </button>
                            <button
                                style={{ ...buttonStyle, marginLeft: '10px', backgroundColor: '#ccc' }}
                                onClick={() => setEditModalVisible(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {formVisible && user && user.role === "manager" && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ marginBottom: '1rem' }}>Create Shift</h3>

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
                            Start:
                            <input
                                type="datetime-local"
                                value={formData.start}
                                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                                style={inputStyle}
                            />
                        </label>

                        <label style={labelStyle}>
                            End:
                            <input
                                type="datetime-local"
                                value={formData.end}
                                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                                style={inputStyle}
                            />
                        </label>

                        <div style={{ marginTop: '1rem' }}>
                            <button style={buttonStyle} onClick={async () => {

                                if (!formData.person || !formData.start || !formData.end) {
                                    alert("Please fill in all fields.");
                                    return; // Stop here if validation fails
                                }
                                try {
                                    await axiosInstance.post('/api/shifts',
                                        {
                                            person: formData.person,
                                            start: toUtcISOString(formData.start),
                                            end: toUtcISOString(formData.end),
                                        },
                                        {
                                            headers: {
                                                Authorization: `Bearer ${user.token}`
                                            }
                                        }
                                    );

                                    setFormVisible(false);
                                    setFormData({ person: '', start: '', end: '' });
                                    fetchShifts();
                                } catch (error) {
                                    alert('Failed to create Shift. In Roster returns.', console.error());
                                }
                            }}>
                                Create
                            </button>

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
                    {user && user.role === "manager" && (
                        <button
                            style={{ ...buttonStyle, marginBottom: "1rem" }}
                            onClick={() => setFormVisible(true)}
                        >
                            Create Shift
                        </button>
                    )}
                </div>
                <div style={styles.main}>
                    {shifts.length > 0 ? (
                        <DayPilotCalendar
                            {...config}
                            events={shifts}
                            startDate={startDate}
                            controlRef={setCalendar}
                        />
                    ) : (
                        <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                            No shifts to display.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Calendar;

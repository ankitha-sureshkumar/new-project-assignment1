import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const LeaveRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({ start: '', end: '', person: '', status: 'pending' });

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axiosInstance.get('/api/leave-requests', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setRequests(response.data);
            } catch (error) {
                setRequests([]);
            }
        };

        const fetchUserProfile = async () => {
            try {
                const response = await axiosInstance.get('/api/auth/profile', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setFormData(prev => ({
                    ...prev,
                    person: response.data.name
                }));
            } catch (error) {
                alert("Failed to fetch user profile");
            }
        };

        if (user?.token) {
            fetchRequests();
            fetchUserProfile();
        }
    }, [user]);

    const handleCreateRequest = async () => {
        if (!formData.start || !formData.end) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            await axiosInstance.post(
                '/api/leave-requests',
                {
                    person: formData.person,
                    start: formData.start,
                    end: formData.end,
                    status: 'pending' // Default status
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            setFormVisible(false);
            setFormData({ start: '', end: '', person: formData.person, status: 'pending' });

            const response = await axiosInstance.get('/api/leave-requests', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRequests(response.data);
        } catch (error) {
            console.error("Create error:", error);
            alert("Failed to create leave request.");
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axiosInstance.put(
                `/api/leave-requests/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setRequests(prev =>
                prev.map(r => (r._id === id ? { ...r, status: newStatus } : r))
            );
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/api/leave-requests/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            alert("Failed to delete request.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Leave Requests</h2>

            {/* Show Create button only for non-managers */}
            {user.role !== 'manager' && (
                <div className="mb-4 text-center">
                    <button
                        onClick={() => setFormVisible(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Create Leave Request
                    </button>
                </div>
            )}

            {/* Table */}
            <table className="min-w-full bg-white shadow rounded">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Employee</th>
                        <th className="py-2 px-4 border-b">Dates</th>
                        <th className="py-2 px-4 border-b">Status</th>
                        {user.role !== 'manager' && <th className="py-2 px-4 border-b">Actions</th>}
                        {user.role === 'manager' && <th className="py-2 px-4 border-b">Update Status</th>}
                    </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-6 text-gray-500">No leave requests found.</td>
                        </tr>
                    ) : (
                        requests.map(req => (
                            <tr key={req._id}>
                                <td className="py-2 px-4 border-b">{req.person}</td>
                                <td className="py-2 px-4 border-b">{req.start} - {req.end}</td>
                                <td className="py-2 px-4 border-b">
                                    <span className={
                                        req.status === 'approved'
                                            ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs'
                                            : req.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs'
                                                : 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs'
                                    }>
                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                    </span>
                                </td>
                                {user.role !== 'manager' && (
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => handleDelete(req._id)}
                                            className="text-red-500 hover:underline mr-2"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                                {user.role === 'manager' && (
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => handleStatusUpdate(req._id, 'approved')}
                                            className="text-green-600 hover:underline mr-2"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                            className="text-red-600 hover:underline"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal Form for Non-Managers */}
            {formVisible && user.role !== 'manager' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h3 className="text-lg font-bold mb-4">Create Leave Request</h3>
                        <label className="block mb-2">
                            Start Date:
                            <input
                                type="date"
                                value={formData.start}
                                onChange={e => setFormData({ ...formData, start: e.target.value })}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </label>
                        <label className="block mb-2">
                            End Date:
                            <input
                                type="date"
                                value={formData.end}
                                onChange={e => setFormData({ ...formData, end: e.target.value })}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </label>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleCreateRequest}
                                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => setFormVisible(false)}
                                className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequests;

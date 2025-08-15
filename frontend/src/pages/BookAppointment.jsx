// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const API_BASE = "http://localhost:5001/api/clinic";

// const BookAppointment = () => {
//   const token = localStorage.getItem("token");
//   const [pets, setPets] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [form, setForm] = useState({
//     petId: "",
//     petName: "",
//     petAge: "",
//     date: "",
//     hospital: "",
//   });

//   const hospitals = [
//     "Oggy Pet Clinic",
//     "Happy Tails Hospital",
//     "Furry Friends Vet",
//     "Paw Care Center",
//     "Animal Health Clinic",
//   ];

//   // Fetch user's pets
//   const fetchPets = async () => {
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get(`${API_BASE}/pets`, { headers });
//       setPets(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Fetch appointments
//   const fetchAppointments = async () => {
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get(`${API_BASE}/appointments`, { headers });
//       setAppointments(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchPets();
//     fetchAppointments();
//   }, []);

//   // Handle pet selection
//   const handlePetChange = (e) => {
//     const selectedPet = pets.find((p) => p._id === e.target.value);
//     setForm({
//       ...form,
//       petId: selectedPet?._id || "",
//       petName: selectedPet?.name || "",
//       petAge: selectedPet?.age || "",
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.petId) {
//       alert("Please select a pet.");
//       return;
//     }
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       await axios.post(`${API_BASE}/appointments`, form, { headers });
//       setForm({ petId: "", petName: "", petAge: "", date: "", hospital: "" });
//       fetchAppointments();
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Error booking appointment");
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">📅 Book an Appointment</h1>

//       <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-md mb-8">
//         {/* Select Pet */}
//         <select
//           value={form.petId}
//           onChange={handlePetChange}
//           className="border p-2 rounded w-full mb-4"
//           required
//         >
//           <option value="">Select Pet</option>
//           {pets.map((p) => (
//             <option key={p._id} value={p._id}>
//               {p.name} ({p.age} yrs)
//             </option>
//           ))}
//         </select>

//         {/* Date */}
//         <input
//           type="date"
//           value={form.date}
//           onChange={(e) => setForm({ ...form, date: e.target.value })}
//           className="border p-2 rounded w-full mb-4"
//           required
//         />

//         {/* Hospital */}
//         <select
//           value={form.hospital}
//           onChange={(e) => setForm({ ...form, hospital: e.target.value })}
//           className="border p-2 rounded w-full mb-4"
//           required
//         >
//           <option value="">Select Hospital</option>
//           {hospitals.map((h, i) => (
//             <option key={i} value={h}>{h}</option>
//           ))}
//         </select>

//         <button
//           type="submit"
//           className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
//         >
//           Book Appointment
//         </button>
//       </form>

//       <div className="bg-white p-6 rounded shadow-md">
//         <h2 className="text-2xl font-bold mb-4">Manage Appointments</h2>
//         {appointments.length === 0 ? (
//           <p>No appointments booked yet.</p>
//         ) : (
//           <table className="w-full table-auto border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border px-4 py-2">Pet Name</th>
//                 <th className="border px-4 py-2">Pet Age</th>
//                 <th className="border px-4 py-2">Date</th>
//                 <th className="border px-4 py-2">Hospital</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map((a) => (
//                 <tr key={a._id}>
//                   <td className="border px-4 py-2">{a.petName}</td>
//                   <td className="border px-4 py-2">{a.petAge}</td>
//                   <td className="border px-4 py-2">{new Date(a.date).toLocaleDateString()}</td>
//                   <td className="border px-4 py-2">{a.hospital}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BookAppointment;

// ***************************************************************************************************
// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const API_BASE = "http://localhost:5001/api/clinic";

// const BookAppointment = () => {
//   const token = localStorage.getItem("token");
//   const [appointments, setAppointments] = useState([]);
//   const [pets, setPets] = useState([]);
//   const [form, setForm] = useState({
//     petId: "",
//     date: "",
//     hospital: "",
//   });

//   const hospitals = [
//     "Logan Hospital, Brisbane",
//     "Must Care Hospital, Ipiswich",
//     "Furry Friends Vet, Mount gravatt",
//     "Paw Care, Sunnybank",
//     "Vet SUrgery and Health Clinic, Goldcoast",
//   ];

//   // Fetch appointments
//   const fetchAppointments = async () => {
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get(`${API_BASE}/appointments`, { headers });
//       setAppointments(res.data);
//     } catch (err) {
//       console.error("Error fetching appointments:", err);
//     }
//   };

//   // Fetch pets
//   const fetchPets = async () => {
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get(`${API_BASE}/pets`, { headers });
//       setPets(res.data);
//     } catch (err) {
//       console.error("Error fetching pets:", err);
//     }
//   };

//   useEffect(() => {
//     fetchPets();
//     fetchAppointments();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.petId || !form.date || !form.hospital) {
//       alert("Please fill all fields");
//       return;
//     }
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       await axios.post(`${API_BASE}/appointments`, form, { headers });
//       setForm({ petId: "", date: "", hospital: "" });
//       fetchAppointments();
//     } catch (err) {
//       console.error("Error booking appointment:", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this appointment?")) return;

//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       await axios.delete(`${API_BASE}/appointments/${id}`, { headers });
//       fetchAppointments();
//     } catch (err) {
//       console.error("Error deleting appointment:", err);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">📅 Book an Appointment</h1>

//       <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-md mb-8">
//         <select
//           value={form.petId}
//           onChange={(e) => setForm({ ...form, petId: e.target.value })}
//           className="border p-2 rounded w-full mb-4"
//           required
//         >
//           <option value="">Select Pet</option>
//           {pets.map((p) => (
//             <option key={p._id} value={p._id}>{p.name}</option>
//           ))}
//         </select>

//         <input
//           type="date"
//           value={form.date}
//           onChange={(e) => setForm({ ...form, date: e.target.value })}
//           className="border p-2 rounded w-full mb-4"
//           required
//         />

//         <select
//           value={form.hospital}
//           onChange={(e) => setForm({ ...form, hospital: e.target.value })}
//           className="border p-2 rounded w-full mb-4"
//           required
//         >
//           <option value="">Select Hospital</option>
//           {hospitals.map((h, i) => (
//             <option key={i} value={h}>{h}</option>
//           ))}
//         </select>

//         <button
//           type="submit"
//           className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
//         >
//           Book Appointment
//         </button>
//       </form>
//       <h2 className="text-3xl font-bold mb-4">🐾 Manage Appointments</h2>
//       <div className="bg-white p-6 rounded shadow-md">
        
//         {appointments.length === 0 ? (
//           <p>No appointments booked yet.</p>
//         ) : (
//           <table className="w-full table-auto border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border px-4 py-2">Pet Name</th>
//                 <th className="border px-4 py-2">Date</th>
//                 <th className="border px-4 py-2">Hospital</th>
//                 <th className="border px-4 py-2">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map((a) => (
//                 <tr key={a._id}>
//                   <td className="border px-4 py-2">{a.petName || a.petId?.name}</td>
//                   <td className="border px-4 py-2">{new Date(a.date).toLocaleDateString()}</td>
//                   <td className="border px-4 py-2">{a.hospital}</td>
//                   <td className="border px-4 py-2">
//                     <button
//                       onClick={() => handleDelete(a._id)}
//                       className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BookAppointment;



import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5001/api/clinic";

const BookAppointment = () => {
  const token = localStorage.getItem("token");
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState({
    petId: "",
    petName: "",   // <-- added
    petAge: "",    // <-- added
    date: "",
    hospital: "",
  });

  const hospitals = [
    "Logan Hospital, Brisbane",
    "Must Care Hospital, Ipiswich",
    "Furry Friends Vet, Mount gravatt",
    "Paw Care, Sunnybank",
    "Vet Surgery and Health Clinic, Goldcoast",
  ];

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE}/appointments`, { headers });
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  // Fetch pets
  const fetchPets = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE}/pets`, { headers });
      setPets(res.data);
    } catch (err) {
      console.error("Error fetching pets:", err);
    }
  };

  useEffect(() => {
    fetchPets();
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.petId || !form.date || !form.hospital) {
      alert("Please fill all fields");
      return;
    }

    // ------------------ Set petName and petAge from selected pet ------------------
    const selectedPet = pets.find((p) => p._id === form.petId);
    if (selectedPet) {
      form.petName = selectedPet.name;
      form.petAge = selectedPet.age || ""; // assuming your Pet model has age
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_BASE}/appointments`, form, { headers });
      setForm({ petId: "", petName: "", petAge: "", date: "", hospital: "" });
      fetchAppointments();
    } catch (err) {
      console.error("Error booking appointment:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE}/appointments/${id}`, { headers });
      fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📅 Book an Appointment</h1>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-md mb-8">
        <select
          value={form.petId}
          onChange={(e) => setForm({ ...form, petId: e.target.value })}
          className="border p-2 rounded w-full mb-4"
          required
        >
          <option value="">Select Pet</option>
          {pets.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.age} yrs)
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border p-2 rounded w-full mb-4"
          required
        />

        <select
          value={form.hospital}
          onChange={(e) => setForm({ ...form, hospital: e.target.value })}
          className="border p-2 rounded w-full mb-4"
          required
        >
          <option value="">Select Hospital</option>
          {hospitals.map((h, i) => (
            <option key={i} value={h}>
              {h}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
        >
          Book Appointment
        </button>
      </form>

      <h2 className="text-3xl font-bold mb-4">🐾 Manage Appointments</h2>
      <div className="bg-white p-6 rounded shadow-md">
        {appointments.length === 0 ? (
          <p>No appointments booked yet.</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Pet Name</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Hospital</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td className="border px-4 py-2">{a.petName || a.petId?.name}</td>
                  <td className="border px-4 py-2">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{a.hospital}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;

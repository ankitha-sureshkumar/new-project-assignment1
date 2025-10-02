// src/pages/Pets.jsx
import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Pets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    age: '',
  });

  // Fetch pets on mount
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axiosInstance.get('/api/pets', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPets(response.data);
      } catch (error) {
        alert('Failed to fetch pets.');
      }
    };
    fetchPets();
  }, [user]);

  // Handle form submit for add/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPet) {
        const response = await axiosInstance.put(`/api/pets/${editingPet._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPets(pets.map((p) => (p._id === editingPet._id ? response.data : p)));
        setEditingPet(null);
      } else {
        const response = await axiosInstance.post('/api/pets', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPets([...pets, response.data]);
      }
      setFormData({ name: '', species: '', age: '' });
    } catch (error) {
      alert('Failed to save pet.');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return;
    try {
      await axiosInstance.delete(`/api/pets/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPets(pets.filter((p) => p._id !== id));
    } catch (error) {
      alert('Failed to delete pet.');
    }
  };

  // Handle edit
  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      age: pet.age,
    });
  };

  return (

    
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Please add or Edit your Pet details for easy Appointments..!!!</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-4">
        <h2 className="text-xl font-bold mb-4">{editingPet ? 'Edit Pet' : 'Add Pet'}</h2>
        <input
          type="text"
          placeholder="Pet Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Species"
          value={formData.species}
          onChange={(e) => setFormData({ ...formData, species: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingPet ? 'Update Pet' : 'Add Pet'}
        </button>
      </form>

      {pets.map((pet) => (
        <div key={pet._id} className="bg-gray-100 p-3 mb-2 rounded shadow">
          <h3 className="font-bold">{pet.name}</h3>
          <p>{pet.species}</p>
          <p>Age: {pet.age}</p>
          <div className="mt-2">
            <button
              onClick={() => handleEdit(pet)}
              className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(pet._id)}
              className="bg-red-600 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Pets;

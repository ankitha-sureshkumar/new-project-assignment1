import { useNavigate } from 'react-router-dom';
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">🐾 Welcome to Oggy Pet Clinic Management 🐾</h1>
        <p className="text-lg text-gray-700 mb-6">
          Caring for your furry friends with love, compassion, and expert care.
        </p>
        <button
          onClick={() => navigate('/doctors')}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          Check Nearby Doctors
        </button>
      </div>

      {/* Reviews Section */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-8 text-center">💬 What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          <div className="bg-white p-4 rounded shadow">
            <img
                src="/images/lab.jpeg"
                alt="Cute Pet 3"
                className="w-64 h-64 object-cover rounded-lg shadow-md"
            />
            <p>"Oggy Pet Clinic saved my puppy's life! The doctors are amazing. So grateful to them, Happy to a part of Oggy..."</p>
            <span className="text-sm text-gray-600">- Nick Thomas M.</span>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <img
                src="/images/pitbull.jpg"
                alt="Cute Pet 2"
                className="w-64 h-64 object-cover rounded-lg shadow-md"
            />
            <p>"Very friendly staff and excellent service. Highly recommend! So satisfied with service!!!"</p>
            <span className="text-sm text-gray-600">- Saraha Banu K.</span>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <img
                src="/images/black-kitty.jpg"
                alt="Cute Pet 3"
                className="w-64 h-64 object-cover rounded-lg shadow-md"
            />
            <p>"Best place for my cats. They feel so comfortable here. My kitty liked all goodiess!! "</p>
            <span className="text-sm text-gray-600">- Arjun Mark R.</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Home;

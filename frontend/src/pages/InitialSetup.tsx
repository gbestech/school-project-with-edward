import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InitialSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      setup_secret: 'allow-first-setup', // Match your SETUP_SECRET
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

interface FormData {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    setup_secret: string;
}

interface ChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

const handleChange = (e: ChangeEvent) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/setup-admin/`,
            formData
        );
        const message = response.data?.message || 'Superuser created successfully!';
        alert(message);
        // alert('Superuser created successfully! You can now login.', message);
        navigate('/login');
    } catch (err: any) {
        setError(
            err.response?.data?.error || 
            'Failed to create superuser. Check console for details.'
        );
        console.error('Setup error:', err.response?.data);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Initial School Setup
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Create the first administrator account for your school
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialSetup;
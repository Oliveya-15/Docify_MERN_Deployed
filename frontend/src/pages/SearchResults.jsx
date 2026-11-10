import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { FaCommentAlt } from 'react-icons/fa';
import { AppContext } from '../context/AppContext';

const SearchResults = () => {
  const { backendUrl } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = new URLSearchParams(location.search).get('query');

  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!searchQuery || !searchQuery.trim()) {
        setError('Please enter a valid search query.');
        setDoctors([]);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const { data } = await axios.get(backendUrl + '/api/doctor/search', {
          params: { q: searchQuery.trim() },
        });

        // Guard: only accept a real array (never a string/HTML response)
        if (Array.isArray(data)) {
          setDoctors(data);
          setError(data.length === 0 ? 'No doctors found' : '');
        } else {
          setDoctors([]);
          setError('Error fetching doctors');
        }
      } catch (err) {
        console.error('Error fetching doctors', err);
        setDoctors([]);
        setError('Something went wrong while fetching the doctors.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [searchQuery, backendUrl]);

  return (
    <div>
      <h2 className='text-gray-600 text-lg mb-0 mt-0'>Search Results :</h2>

      {loading && <p className='text-gray-500 mt-4'>Searching...</p>}

      {!loading && error && (
        <p style={{ color: 'lightcoral' }}>{error}</p>
      )}

      {!loading && doctors.length > 0 && (
        <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
          {doctors.map((doctor) => (
            <div
              onClick={() => {
                navigate(`/appointment/${doctor._id}`);
                scrollTo(0, 0);
              }}
              className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
              key={doctor._id}
            >
              <img className='bg-blue-50 w-full h-48 object-cover' src={doctor.image} alt={doctor.name} />
              <div className='p-4'>
                <div className={`flex items-center gap-2 text-sm text-center ${doctor.available ? 'text-green-500' : 'text-gray-500'}`}>
                  <p className={`w-2 h-2 ${doctor.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></p>
                  <p>{doctor.available ? 'Available' : 'Not Available'}</p>
                </div>
                <p className='text-gray-900 text-lg font-medium'>{doctor.name}</p>
                <p className='text-gray-600 text-sm'>{doctor.speciality}</p>
                <p className='text-gray-500 text-xs'>
                  {doctor.address?.line1}{doctor.address?.line2 ? `, ${doctor.address.line2}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error === 'No doctors found' && (
        <div>
          <NavLink to='/doctalk'>
            <button className='px-6 py-2 mt-4 bg-primary text-white rounded-md flex items-center justify-center'>
              <FaCommentAlt className='mr-2' /> Chat with DOCTALK
            </button>
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Search, Calendar, Home, HelpCircle, User, ArrowRight } from 'lucide-react';

const AttendanceHistory = () => {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [room, setRoom] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // Fetch rooms list
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await API.get('/rooms');
        setRooms(res.data);
      } catch (e) {
        console.error('Error fetching rooms:', e);
      }
    };
    fetchRooms();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = '/attendance/history?';
      if (room) url += `room=${room}&`;
      if (status) url += `status=${status}&`;
      if (type) url += `type=${type}&`;
      if (startDate) url += `start_date=${startDate}&`;
      if (endDate) url += `end_date=${endDate}&`;
      
      const res = await API.get(url);
      setHistory(res.data);
    } catch (e) {
      showToast('Error querying attendance history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleResetFilters = () => {
    setRoom('');
    setStatus('');
    setType('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    // Trigger immediate refresh with empty parameters
    setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get('/attendance/history');
        setHistory(res.data);
      } catch (e) {
        showToast('Error resetting history list', 'error');
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  // Local query filtering
  const filteredHistory = history.filter((h) => {
    const query = search.toLowerCase();
    return (
      h.student_name.toLowerCase().includes(query) ||
      h.room_number.toLowerCase().includes(query) ||
      (h.remarks && h.remarks.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Attendance Logs</h2>
        <p className="text-gray-500 text-xs mt-1">Review historical attendance entries, remarks, and audit records</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleApplyFilters} className="premium-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Number</label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Rooms</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>Room {r._id}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Late Entry">Late Entry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Period</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Periods</option>
              <option value="morning">Morning Only</option>
              <option value="night">Night Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-50 pt-4">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-100 rounded-xl font-bold text-xs hover:bg-gray-50 text-gray-600 transition-colors"
          >
            Reset Filters
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md transition-all"
          >
            Apply Query
          </button>
        </div>
      </form>

      {/* Query Results */}
      <div className="premium-card overflow-hidden">
        {/* Search bar inside result */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/20 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or room..."
              className="w-full pl-10 pr-4 py-2 border border-gray-100 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <span className="text-gray-400 text-xs font-bold">
            Records Found: {filteredHistory.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Date</th>
                <th className="p-4">Period</th>
                <th className="p-4">Room</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Remarks</th>
                <th className="p-4">Marked By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No matching attendance logs found in history.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h) => {
                  let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  if (h.status === 'Absent') statusBadge = 'bg-rose-50 text-rose-700 border-rose-100';
                  else if (h.status === 'Late Entry') statusBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                  else if (h.status === 'Leave') statusBadge = 'bg-blue-50 text-blue-700 border-blue-100';

                  return (
                    <tr key={h._id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{h.date}</td>
                      <td className="p-4 uppercase text-gray-400 font-semibold">{h.type}</td>
                      <td className="p-4 font-bold text-gray-800">Room {h.room_number}</td>
                      <td className="p-4">
                        <Link 
                          to={`/students/${h.student_id}`}
                          className="text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1 group"
                        >
                          {h.student_name}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusBadge}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 italic">
                        {h.remarks ? `"${h.remarks}"` : '—'}
                      </td>
                      <td className="p-4 text-gray-400 font-semibold">
                        {h.marked_by}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;

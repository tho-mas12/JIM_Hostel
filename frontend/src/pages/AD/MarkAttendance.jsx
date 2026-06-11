import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { UserCheck, Calendar, Sun, Moon, Home, HelpCircle, Save, CheckCircle2, ChevronRight, X } from 'lucide-react';

const MarkAttendance = () => {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('morning'); // 'morning' or 'night'
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { student_id: 'Present'/'Absent'/'Late Entry' }
  const [remarks, setRemarks] = useState({}); // { student_id: 'Remark string' }
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [markedBy, setMarkedBy] = useState('');

  // Load available rooms list
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await API.get('/rooms');
        setRooms(res.data);
      } catch (e) {
        showToast('Error loading rooms list', 'error');
      }
    };
    fetchRooms();
  }, []);

  const loadRoomStudents = async () => {
    if (!selectedRoom) {
      showToast('Please select a room', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/attendance/room/${selectedRoom}?date=${date}&type=${type}`);
      const list = res.data.students || [];
      setStudents(list);
      setMarkedBy(res.data.marked_by || '');
      
      // Initialize states
      const initialAtt = {};
      const initialRemarks = {};
      list.forEach((s) => {
        initialAtt[s.student_id] = s.status || 'Present';
        initialRemarks[s.student_id] = s.remarks || '';
      });
      setAttendance(initialAtt);
      setRemarks(initialRemarks);
      
      if (res.data.marked_by) {
        showToast(`Loaded same-day attendance previously marked by ${res.data.marked_by}`, 'info');
      }
    } catch (e) {
      showToast('Error loading students for the selected room', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (sId) => {
    // Cycles: Present -> Absent -> Late Entry -> Present
    setAttendance((prev) => {
      const current = prev[sId];
      let next = 'Present';
      if (current === 'Present') next = 'Absent';
      else if (current === 'Absent') next = 'Late Entry';
      return { ...prev, [sId]: next };
    });
  };

  const handleRemarkChange = (sId, val) => {
    setRemarks((prev) => ({ ...prev, [sId]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) {
      showToast('No student data loaded to submit', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/attendance', {
        room_number: selectedRoom,
        date: date,
        type: type,
        attendance: attendance,
        remarks: remarks
      });
      
      // Open success modal
      setShowSuccessModal(true);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit attendance roll call', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    // Clear student list to force AD to load another room
    setStudents([]);
    setSelectedRoom('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Mark Room Attendance</h2>
        <p className="text-gray-500 text-xs mt-1">Select block room and execute daily roll call validation</p>
      </div>

      {/* Filter panel */}
      <div className="premium-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Number</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  Room {r._id} ({r.occupied} / {r.capacity} Occupied)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Attendance Period</label>
            <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100/50">
              <button
                type="button"
                onClick={() => setType('morning')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  type === 'morning' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Sun className="w-4 h-4" /> Morning
              </button>
              <button
                type="button"
                onClick={() => setType('night')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  type === 'night' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Moon className="w-4 h-4" /> Night
              </button>
            </div>
          </div>

          <button
            onClick={loadRoomStudents}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] h-[38px] flex items-center justify-center gap-2"
          >
            Load Student List
          </button>
        </div>
      </div>

      {/* Marks Checklist Panel */}
      {loading ? (
        <div className="premium-card p-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-bold mt-3">Loading student profiles...</p>
        </div>
      ) : students.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-6 scale-enter">
          {markedBy && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-primary font-semibold">
              ⚠️ Warning: Attendance for this room and slot has already been marked today by {markedBy}. Submitting will overwrite previous logs.
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((s) => {
              const status = attendance[s.student_id];
              const isLeave = status === 'Leave';
              
              let statusStyle = 'border-emerald-100 bg-emerald-50/20';
              let statusBadge = 'bg-success text-white';
              
              if (status === 'Absent') {
                statusStyle = 'border-rose-100 bg-rose-50/20';
                statusBadge = 'bg-danger text-white';
              } else if (status === 'Late Entry') {
                statusStyle = 'border-amber-100 bg-amber-50/20';
                statusBadge = 'bg-amber-500 text-white';
              } else if (status === 'Leave') {
                statusStyle = 'border-blue-100 bg-blue-50/20';
                statusBadge = 'bg-blue-500 text-white';
              }

              return (
                <div 
                  key={s.student_id}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 ${statusStyle}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 leading-tight">{s.name}</h4>
                    </div>

                    <button
                      type="button"
                      disabled={isLeave}
                      onClick={() => handleStatusToggle(s.student_id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all duration-200 shadow-sm/5 active:scale-95 ${
                        isLeave ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : statusBadge
                      }`}
                    >
                      {status}
                    </button>
                  </div>

                  {(status === 'Absent' || status === 'Late Entry') && (
                    <div className="flex gap-2 items-center animate-scale-in">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Remarks:</span>
                      <input
                        type="text"
                        value={remarks[s.student_id] || ''}
                        onChange={(e) => handleRemarkChange(s.student_id, e.target.value)}
                        placeholder="e.g. sick, library, late..."
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-gray-700"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Footer */}
          <div className="flex justify-end gap-3 p-4 bg-white rounded-2xl border border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-success hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-success/10 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" /> Submit Attendance Roll Call
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="premium-card p-12 text-center text-gray-400">
          <HelpCircle className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <h4 className="font-bold text-sm text-gray-600">No Student Records Loaded</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Select a room and click "Load Student List" above to start marking roll calls.</p>
        </div>
      )}

      {/* Impressive Success Modal popup overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-gray-100 shadow-2xl scale-enter relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-success flex items-center justify-center mx-auto mb-5 animate-pulse-subtle">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h3 className="font-extrabold text-xl text-gray-900 mb-2">Roll Call Submitted!</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              The attendance logs for <strong className="text-gray-700">Room {selectedRoom}</strong> ({type.toUpperCase()}) have been successfully saved to the database. All student overall attendance percentages have been recomputed.
            </p>

            <button
              onClick={closeSuccessModal}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;

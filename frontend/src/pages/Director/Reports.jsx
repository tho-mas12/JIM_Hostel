import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { FileSpreadsheet, FileText, Download, Calendar, Home, CheckCircle2, ShieldAlert } from 'lucide-react';

const Reports = () => {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [reportType, setReportType] = useState('daily'); // 'daily', 'defaulter', 'leave', 'occupancy'
  const [format, setFormat] = useState('pdf'); // 'pdf' or 'excel'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [exporting, setExporting] = useState(false);

  // Load available rooms list
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await API.get('/rooms');
        setRooms(res.data);
      } catch (e) {
        console.error('Error loading rooms:', e);
      }
    };
    fetchRooms();
  }, []);

  const handleDownload = async (e) => {
    e.preventDefault();
    setExporting(true);
    showToast('Preparing your report, please wait...', 'info');
    
    try {
      let url = `/reports/export?format=${format}&type=${reportType}&date=${date}`;
      if (selectedRoom && reportType === 'daily') {
        url += `&room=${selectedRoom}`;
      }

      // Fetch file using Axios as a blob response to send JWT headers securely
      const response = await API.get(url, { responseType: 'blob' });
      
      // Create file download link in browser
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `jim_hostel_${reportType}_report_${date}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Report downloaded successfully!', 'success');
    } catch (error) {
      showToast('Error exporting report. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Report Generator</h2>
        <p className="text-gray-500 text-xs mt-1">Configure and export attendance spreadsheets, room listings, and compliance PDFs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration form */}
        <form onSubmit={handleDownload} className="premium-card p-6 lg:col-span-2 space-y-5 h-fit">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
            Configure Export Parameters
          </h3>

          {/* Report Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Report Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => setReportType('daily')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  reportType === 'daily' ? 'border-primary bg-blue-50/10' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span className="font-bold text-xs text-gray-800 block">Daily Roll Call Log</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">Record of student roll checkouts</span>
              </div>

              <div 
                onClick={() => setReportType('defaulter')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  reportType === 'defaulter' ? 'border-primary bg-blue-50/10' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span className="font-bold text-xs text-gray-800 block">Defaulters Risk List</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">Students with attendance &lt; 85%</span>
              </div>

              <div 
                onClick={() => setReportType('leave')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  reportType === 'leave' ? 'border-primary bg-blue-50/10' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span className="font-bold text-xs text-gray-800 block">Leave Clearance History</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">Approved/Rejected student departures</span>
              </div>

              <div 
                onClick={() => setReportType('occupancy')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  reportType === 'occupancy' ? 'border-primary bg-blue-50/10' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span className="font-bold text-xs text-gray-800 block">Hostel Occupancy Audit</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">Allocations list by block and floor</span>
              </div>
            </div>
          </div>

          {/* Conditional Filters */}
          {reportType === 'daily' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scale-in">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Date</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Filter (Optional)</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="">All Rooms</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>Room {r._id}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Export Format */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Export Format</label>
            <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100/50 max-w-sm">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  format === 'pdf' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 text-rose-500" /> PDF Document
              </button>
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  format === 'excel' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel Sheet
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={exporting}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting File...</span>
              </>
            ) : (
              <>
                <Download className="w-4.5 h-4.5" /> Download {format.toUpperCase()} Report
              </>
            )}
          </button>
        </form>

        {/* Right: Informational tips panel */}
        <div className="premium-card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
            Export Guidelines
          </h3>
          <ul className="space-y-3 text-xs font-medium text-gray-500 leading-normal">
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>PDF documents generate styled summaries, complete with signature banners and branding, suitable for formal print auditing.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Excel formats include structured column borders, grid lines, and cell highlights, suitable for spreadsheet filtering.</span>
            </li>
            <li className="flex gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Leaves list includes all historical entries. Occupancy list reflects current system states.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;

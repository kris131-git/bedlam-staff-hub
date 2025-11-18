
import React, { useState, useMemo } from 'react';
import { Attendee } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface RegistrationPageProps {
  attendees: Attendee[];
  onCheckIn: (id: string) => void;
  onUncheckIn: (id: string) => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ attendees, onCheckIn, onUncheckIn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null);

  const filteredAttendees = useMemo(() => {
    return attendees.filter(attendee =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attendees, searchTerm]);

  const formatCheckInTime = (isoString?: string) => {
    if (!isoString) return 'Not Arrived';
    return new Date(isoString).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const initiateUncheckIn = (id: string) => {
      setSelectedAttendeeId(id);
      setConfirmModalOpen(true);
  };

  const confirmUncheckIn = () => {
      if (selectedAttendeeId) {
          onUncheckIn(selectedAttendeeId);
          setConfirmModalOpen(false);
          setSelectedAttendeeId(null);
      }
  };

  const cancelUncheckIn = () => {
      setConfirmModalOpen(false);
      setSelectedAttendeeId(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Attendee Registration</h1>
      
      <div className="relative flex-1 md:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
        />
      </div>

      <div className="bg-dark-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Arrival Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredAttendees.map(attendee => (
                <tr key={attendee.id} className="hover:bg-dark-border/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{attendee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {attendee.checkInTime ? (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-500/20 text-green-300">Checked In</span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-300">Not Arrived</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-left">
                    {!attendee.checkInTime ? (
                      <button 
                        onClick={() => onCheckIn(attendee.id)}
                        className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-brand-secondary transition-colors"
                      >
                        Check In
                      </button>
                    ) : (
                        <button 
                        onClick={() => initiateUncheckIn(attendee.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/50 text-xs font-semibold rounded-md hover:bg-red-500/40 transition-colors"
                      >
                        Uncheck In
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text text-right">
                    {attendee.checkInTime ? formatCheckInTime(attendee.checkInTime) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Popup */}
      {confirmModalOpen && (
           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-sm border border-dark-border">
                    <h3 className="text-lg font-bold text-white mb-2">Undo Check-in?</h3>
                    <p className="text-dark-text-secondary mb-6">Are you sure you want to mark this attendee as not arrived?</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={cancelUncheckIn} className="px-4 py-2 bg-dark-border text-white text-sm font-medium rounded-md hover:bg-gray-600">Cancel</button>
                        <button onClick={confirmUncheckIn} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">Yes, Uncheck</button>
                    </div>
                </div>
           </div>
      )}
    </div>
  );
};

export default RegistrationPage;

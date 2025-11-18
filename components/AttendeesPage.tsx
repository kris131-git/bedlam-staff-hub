
import React, { useState, useMemo } from 'react';
import { Attendee, AttendeeType, TicketType } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface AttendeesPageProps {
  attendees: Attendee[];
  onCreate: (attendee: Omit<Attendee, 'id'>) => void;
  onUpdate: (attendee: Attendee) => void;
  onDelete: (id: string) => void;
}

const AttendeeTypeBadge: React.FC<{ type: AttendeeType }> = ({ type }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  const typeClasses = {
    [AttendeeType.Staff]: "bg-blue-500/20 text-blue-300",
    [AttendeeType.Customer]: "bg-green-500/20 text-green-300",
    [AttendeeType.Artist]: "bg-purple-500/20 text-purple-300",
    [AttendeeType.Volunteer]: "bg-yellow-500/20 text-yellow-300",
  };
  return <span className={`${baseClasses} ${typeClasses[type]}`}>{type}</span>;
};


const AttendeesPage: React.FC<AttendeesPageProps> = ({ attendees, onCreate, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AttendeeType | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAttendee, setCurrentAttendee] = useState<Attendee | Partial<Attendee> | null>(null);

  const filteredAttendees = useMemo(() => {
    return attendees.filter(attendee => {
      const matchesSearch =
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (attendee.phone && attendee.phone.includes(searchTerm)) ||
        (attendee.position && attendee.position.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === 'All' || attendee.type === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [attendees, searchTerm, filterType]);

  const openModal = (attendee: Attendee | null = null) => {
    setCurrentAttendee(attendee ? { ...attendee } : { 
        name: '', 
        type: AttendeeType.Customer, 
        contact: '', 
        phone: '',
        paid: false, 
        position: '',
        notes: '',
        ticketTier: undefined
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAttendee(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAttendee) return;

    if ('id' in currentAttendee && currentAttendee.id) {
      onUpdate(currentAttendee as Attendee);
    } else {
      onCreate(currentAttendee as Omit<Attendee, 'id'>);
    }
    closeModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendee?')) {
      onDelete(id);
    }
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | boolean = value;
    if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
    }
    setCurrentAttendee(prev => prev ? { ...prev, [name]: finalValue } : null);
  };


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Attendees</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors">
          Add Attendee
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search by name, contact, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(['All', ...Object.values(AttendeeType)] as const).map(type => (
                 <button
                 key={type}
                 onClick={() => setFilterType(type)}
                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 ${filterType === type ? 'bg-brand-primary text-white' : 'bg-dark-card hover:bg-dark-border'}`}
               >
                 {type}
               </button>
            ))}
        </div>
      </div>

      <div className="bg-dark-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Contact Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Status / Details</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Notes</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredAttendees.map(attendee => (
                <tr key={attendee.id} className="hover:bg-dark-border/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{attendee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><AttendeeTypeBadge type={attendee.type} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                      <div className="flex flex-col">
                          <span>{attendee.contact}</span>
                          <span className="text-xs text-dark-text-secondary">{attendee.phone || '-'}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                    {attendee.type === AttendeeType.Customer ? (
                      <div className="flex flex-col">
                          <span className={`font-semibold ${attendee.paid ? 'text-green-400' : 'text-red-400'}`}>
                            {attendee.paid ? 'Paid' : 'Unpaid'}
                          </span>
                          {attendee.paid && attendee.ticketTier && (
                              <span className="text-xs text-brand-primary">{attendee.ticketTier}</span>
                          )}
                      </div>
                    ) : (
                      attendee.position || 'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-text max-w-xs truncate">
                      {attendee.notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button onClick={() => openModal(attendee)} className="text-brand-primary hover:text-brand-secondary p-1"><EditIcon /></button>
                    <button onClick={() => handleDelete(attendee.id)} className="text-red-500 hover:text-red-400 p-1 ml-2"><DeleteIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && currentAttendee && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-8 w-full max-w-lg relative">
            <h2 className="text-2xl font-bold text-white mb-6">{'id' in currentAttendee ? 'Edit' : 'Add'} Attendee</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Name</label>
                    <input type="text" name="name" value={currentAttendee.name} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Contact Email</label>
                    <input type="text" name="contact" value={currentAttendee.contact} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Phone Number</label>
                    <input type="text" name="phone" value={currentAttendee.phone || ''} onChange={handleFormChange} className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Type</label>
                    <select name="type" value={currentAttendee.type} onChange={handleFormChange} className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary">
                    {Object.values(AttendeeType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
              </div>

              {currentAttendee.type === AttendeeType.Customer ? (
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-3 border border-dark-border">
                    <div className="flex items-center">
                        <input id="paid" type="checkbox" name="paid" checked={!!currentAttendee.paid} onChange={handleFormChange} className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-brand-primary focus:ring-brand-secondary" />
                        <label htmlFor="paid" className="ml-2 block text-sm text-white font-medium">Has Paid?</label>
                    </div>
                    {currentAttendee.paid && (
                         <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-1">Ticket Type</label>
                            <select name="ticketTier" value={currentAttendee.ticketTier || ''} onChange={handleFormChange} className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary">
                                <option value="">Select Ticket</option>
                                {Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                         </div>
                    )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-1">Position</label>
                  <input type="text" name="position" value={currentAttendee.position || ''} onChange={handleFormChange} className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
              )}

               <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Notes</label>
                    <textarea name="notes" rows={3} value={currentAttendee.notes || ''} onChange={handleFormChange} className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-dark-border text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeesPage;

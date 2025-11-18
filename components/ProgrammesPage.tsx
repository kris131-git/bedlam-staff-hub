
import React, { useState } from 'react';
import { ProgrammeEvent, StaffShift, VolunteerShift, Attendee, User } from '../types';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

type ProgrammeTab = 'all' | 'events' | 'staff' | 'volunteers' | 'personal';

interface ProgrammesPageProps {
  events: ProgrammeEvent[];
  onCreateEvent: (event: Omit<ProgrammeEvent, 'id'>) => void;
  onUpdateEvent: (event: ProgrammeEvent) => void;
  onDeleteEvent: (id: string) => void;
  staffShifts: StaffShift[];
  onCreateStaffShift: (shift: Omit<StaffShift, 'id'>) => void;
  onUpdateStaffShift: (shift: StaffShift) => void;
  onDeleteStaffShift: (id: string) => void;
  volunteerShifts: VolunteerShift[];
  onCreateVolunteerShift: (shift: Omit<VolunteerShift, 'id'>) => void;
  onUpdateVolunteerShift: (shift: VolunteerShift) => void;
  onDeleteVolunteerShift: (id: string) => void;
  attendees: Attendee[];
  currentUser: User;
}

const LOCATIONS = [
  'Main Camping', 
  'The Woods', 
  'The Barn', 
  'The Attic', 
  'The Courtyard', 
  'The Bar', 
  'The Yurt Field', 
  'Main Gate', 
  'Car Park', 
  'Polytunnels'
];

const TabButton: React.FC<{ label: string; name: ProgrammeTab; activeTab: ProgrammeTab; onClick: (tab: ProgrammeTab) => void; }> = ({ label, name, activeTab, onClick }) => (
    <button
      onClick={() => onClick(name)}
      className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
        activeTab === name
          ? 'text-brand-primary border-brand-primary'
          : 'text-dark-text-secondary border-transparent hover:text-dark-text hover:border-dark-border'
      }`}
    >
      {label}
    </button>
  );
  
const ScheduleTable: React.FC<{ headers: string[], data: (string | React.ReactNode)[][] }> = ({ headers, data }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-gray-800/50">
                <tr>
                    {headers.map((header) => (
                        <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider ${header === 'Actions' && 'text-right'}`}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-dark-border/50 transition-colors">
                        {row.map((cell, cellIndex) => (
                             <td key={cellIndex} className={`px-6 py-4 whitespace-nowrap text-sm text-dark-text ${headers[cellIndex] === 'Actions' && 'text-right'}`}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const ProgrammesPage: React.FC<ProgrammesPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<ProgrammeTab>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [attendeeSearch, setAttendeeSearch] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    
    // Time picker state for splitting "18:00 - 19:00"
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Helper to get attendee names from IDs
    const getNames = (ids: string[]) => {
        if (!ids || ids.length === 0) return 'Unassigned';
        return ids.map(id => props.attendees.find(a => a.id === id)?.name || 'Unknown').join(', ');
    };

    // Helper to identify the current user in the attendee list
    const getCurrentUserAttendeeId = () => {
        const match = props.attendees.find(a => a.name.toLowerCase().includes(props.currentUser.username.toLowerCase()));
        return match?.id;
    };

    const openModal = (item: any | null = null) => {
        if (activeTab === 'all' || activeTab === 'personal') return; 
        
        setAttendeeSearch('');
        setLocationSearch('');

        const defaults = {
            all: {},
            events: { date: '', day: 'Friday', time: '', eventName: '', stage: '', details: '' },
            staff: { date: '', day: 'Friday', time: '', attendeeIds: [], role: '', locations: [] },
            volunteers: { date: '', day: 'Friday', time: '', attendeeIds: [], task: '', locations: [] },
            personal: {}
        };

        const itemToLoad = item ? { ...item } : defaults[activeTab];
        
        // Parse time if exists
        if (itemToLoad.time && itemToLoad.time.includes(' - ')) {
            const [start, end] = itemToLoad.time.split(' - ');
            setStartTime(start.trim());
            setEndTime(end.trim());
        } else {
            setStartTime('');
            setEndTime('');
        }

        setCurrentItem(itemToLoad);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setStartTime('');
        setEndTime('');
    };

    const handleDelete = (id: string, type?: string) => {
      if (!window.confirm('Are you sure you want to delete this item?')) return;
      
      const targetTab = type ? (type === 'Event' ? 'events' : type === 'Staff' ? 'staff' : 'volunteers') : activeTab;

      switch (targetTab) {
          case 'events': props.onDeleteEvent(id); break;
          case 'staff': props.onDeleteStaffShift(id); break;
          case 'volunteers': props.onDeleteVolunteerShift(id); break;
      }
    };
    
    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentItem) return;

      // Combine times
      let formattedTime = currentItem.time;
      if (startTime && endTime) {
          formattedTime = `${startTime} - ${endTime}`;
      } else if (startTime) {
          formattedTime = startTime;
      }

      const dataToSave = { ...currentItem, time: formattedTime };
      const { id, ...data } = dataToSave;

      const handlers = {
        all: { create: () => {}, update: () => {} },
        personal: { create: () => {}, update: () => {} },
        events: { create: props.onCreateEvent, update: props.onUpdateEvent },
        staff: { create: props.onCreateStaffShift, update: props.onUpdateStaffShift },
        volunteers: { create: props.onCreateVolunteerShift, update: props.onUpdateVolunteerShift },
      };

      if (id) {
        handlers[activeTab].update(dataToSave);
      } else {
        handlers[activeTab].create(data);
      }
      closeModal();
    };

    const renderActions = (item: { id: string }, type?: string) => {
        if (activeTab === 'personal') return <span className="text-xs text-gray-500">View Only</span>;

        return (
            <div className="whitespace-nowrap">
                {activeTab !== 'all' && <button onClick={() => openModal(item)} className="text-brand-primary hover:text-brand-secondary p-1"><EditIcon /></button>}
                <button onClick={() => handleDelete(item.id, type)} className="text-red-500 hover:text-red-400 p-1 ml-2"><DeleteIcon /></button>
            </div>
        );
    };

    const getCombinedSchedule = (filterByUserId?: string) => {
        const events = props.events.map(e => ({...e, type: 'Event', display: e.eventName, sub: e.stage, detail: e.details }));
        const staff = props.staffShifts.map(s => ({...s, type: 'Staff', display: getNames(s.attendeeIds), sub: s.role, detail: (s.locations || []).join(', ') }));
        const volunteers = props.volunteerShifts.map(v => ({...v, type: 'Volunteer', display: getNames(v.attendeeIds), sub: v.task, detail: (v.locations || []).join(', ') }));
        
        let all = [...events, ...staff, ...volunteers];
        
        if (filterByUserId) {
            all = all.filter(item => {
                if (item.type === 'Event') return false; 
                if ('attendeeIds' in item && Array.isArray(item.attendeeIds)) {
                    return item.attendeeIds.includes(filterByUserId);
                }
                return false;
            });
        }

        const days = { 'Friday': 1, 'Saturday': 2, 'Sunday': 3 };
        all.sort((a, b) => {
            // Sort by specific date if available, otherwise fallback to Day string logic
            if (a.date && b.date) {
                return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
            }
            const dayDiff = (days[a.day as keyof typeof days] || 4) - (days[b.day as keyof typeof days] || 4);
            if (dayDiff !== 0) return dayDiff;
            return a.time.localeCompare(b.time);
        });
        return all;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'all':
                const combined = getCombinedSchedule();
                return <ScheduleTable 
                    headers={['Type', 'Date / Day', 'Time', 'Name/Event', 'Role/Stage', 'Location/Details', 'Actions']}
                    data={combined.map(c => [
                        <span key={`t-${c.id}`} className={`px-2 py-0.5 rounded text-xs font-bold ${c.type === 'Event' ? 'bg-purple-500/20 text-purple-300' : c.type === 'Staff' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{c.type}</span>,
                        <div key={`d-${c.id}`}>
                            {c.date && <div className="text-xs text-dark-text-secondary">{c.date}</div>}
                            <div>{c.day}</div>
                        </div>,
                        c.time,
                        <span key={`n-${c.id}`} className="font-bold text-white">{c.display}</span>,
                        c.sub,
                        c.detail,
                        renderActions(c, c.type)
                    ])}
                />
            case 'personal':
                const myId = getCurrentUserAttendeeId();
                if (!myId) return <div className="p-8 text-center text-dark-text-secondary">Could not find an attendee profile matching your username ({props.currentUser.username}).</div>;
                
                const mySchedule = getCombinedSchedule(myId);
                if (mySchedule.length === 0) return <div className="p-8 text-center text-dark-text-secondary">You have no shifts assigned yet.</div>;

                return <ScheduleTable 
                    headers={['Type', 'Date / Day', 'Time', 'Task/Role', 'Location', 'Actions']}
                    data={mySchedule.map(c => [
                        <span key={`t-${c.id}`} className={`px-2 py-0.5 rounded text-xs font-bold ${c.type === 'Staff' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{c.type}</span>,
                        <div key={`d-${c.id}`}>
                             {c.date && <div className="text-xs text-dark-text-secondary">{c.date}</div>}
                             <div>{c.day}</div>
                        </div>,
                        c.time,
                        c.sub,
                        c.detail,
                        renderActions(c, c.type)
                    ])}
                />

            case 'events':
                return <ScheduleTable 
                    headers={['Date / Day', 'Time', 'Event', 'Stage', 'Details', 'Actions']} 
                    data={props.events.map(e => [
                        <div key={`d-${e.id}`}>
                             {e.date && <div className="text-xs text-dark-text-secondary">{e.date}</div>}
                             <div>{e.day}</div>
                        </div>,
                        e.time, 
                        <span key={e.id} className="font-bold text-white">{e.eventName}</span>, 
                        e.stage, 
                        e.details, 
                        renderActions(e)
                    ])} 
                />;
            case 'staff':
                return <ScheduleTable 
                    headers={['Date / Day', 'Time', 'Staff Member(s)', 'Role', 'Location(s)', 'Actions']} 
                    data={props.staffShifts.map(s => [
                        <div key={`d-${s.id}`}>
                             {s.date && <div className="text-xs text-dark-text-secondary">{s.date}</div>}
                             <div>{s.day}</div>
                        </div>,
                        s.time, 
                        <span key={s.id} className="font-bold text-white">{getNames(s.attendeeIds)}</span>, 
                        s.role, 
                        (s.locations || []).join(', '), 
                        renderActions(s)
                    ])}
                />;
            case 'volunteers':
                return <ScheduleTable 
                    headers={['Date / Day', 'Time', 'Volunteer(s)', 'Task', 'Location(s)', 'Actions']} 
                    data={props.volunteerShifts.map(v => [
                        <div key={`d-${v.id}`}>
                             {v.date && <div className="text-xs text-dark-text-secondary">{v.date}</div>}
                             <div>{v.day}</div>
                        </div>,
                        v.time, 
                        <span key={v.id} className="font-bold text-white">{getNames(v.attendeeIds)}</span>, 
                        v.task, 
                        (v.locations || []).join(', '), 
                        renderActions(v)
                    ])}
                />;
            default:
                return null;
        }
    }
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setCurrentItem((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    // Auto-calculate Day based on Date
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateVal = e.target.value;
        const dayName = new Date(dateVal).toLocaleDateString('en-US', { weekday: 'long' });
        setCurrentItem((prev: any) => ({
            ...prev,
            date: dateVal,
            day: dayName // Auto-fill day
        }));
    };

    const toggleAttendeeSelection = (attendeeId: string) => {
        setCurrentItem((prev: any) => {
            const currentIds = prev.attendeeIds || [];
            if (currentIds.includes(attendeeId)) {
                return { ...prev, attendeeIds: currentIds.filter((id: string) => id !== attendeeId) };
            } else {
                return { ...prev, attendeeIds: [...currentIds, attendeeId] };
            }
        });
    };

    const toggleLocationSelection = (location: string) => {
        setCurrentItem((prev: any) => {
            const currentLocs = prev.locations || [];
            if (currentLocs.includes(location)) {
                return { ...prev, locations: currentLocs.filter((l: string) => l !== location) };
            } else {
                return { ...prev, locations: [...currentLocs, location] };
            }
        });
    };

    // Fields logic
    const renderModalFields = () => {
        if (!currentItem) return null;
        
        const commonTimeFields = (
            <>
             <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Date</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-text-secondary">
                        <CalendarDaysIcon />
                    </div>
                     <input 
                        type="date"
                        name="date"
                        value={currentItem.date || ''}
                        onChange={handleDateChange}
                        required
                        className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                    />
                </div>
             </div>
             <div>
                 {/* Day is mostly display now, but editable if needed */}
                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Day (Auto)</label>
                <input 
                    type="text" 
                    name="day" 
                    value={currentItem.day} 
                    onChange={handleFormChange} 
                    className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" 
                />
            </div>
             <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Time Duration</label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-text-secondary">
                            <ClockIcon />
                        </div>
                        <input 
                            type="time" 
                            value={startTime} 
                            onChange={e => setStartTime(e.target.value)} 
                            required 
                            className="w-full pl-10 pr-2 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" 
                        />
                    </div>
                    <span className="text-dark-text-secondary">to</span>
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-text-secondary">
                            <ClockIcon />
                        </div>
                        <input 
                            type="time" 
                            value={endTime} 
                            onChange={e => setEndTime(e.target.value)} 
                            required 
                            className="w-full pl-10 pr-2 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" 
                        />
                    </div>
                </div>
            </div>
            </>
        );

        if (activeTab === 'events') {
            return (
                <>
                    <div className="sm:col-span-2">
                         <label className="block text-sm font-medium text-dark-text-secondary mb-1">Event Name</label>
                         <input type="text" name="eventName" value={currentItem.eventName} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Stage</label>
                        <input type="text" name="stage" value={currentItem.stage} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    
                    {commonTimeFields}

                    <div className="sm:col-span-2">
                         <label className="block text-sm font-medium text-dark-text-secondary mb-1">Details</label>
                         <textarea name="details" rows={3} value={currentItem.details} onChange={handleFormChange} className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                </>
            );
        } else {
            // Logic for Staff and Volunteer Shifts (using Multi-selects)
            const filteredAttendees = props.attendees.filter(a => 
                a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                a.type.toLowerCase().includes(attendeeSearch.toLowerCase())
            );

            const filteredLocations = LOCATIONS.filter(l => 
                l.toLowerCase().includes(locationSearch.toLowerCase())
            );

            return (
                <>
                     {/* Attendee Search & Select */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Assign Attendees (All Types)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Type to search..." 
                                value={attendeeSearch}
                                onChange={(e) => setAttendeeSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-dark-border rounded-t-lg text-white focus:ring-brand-primary focus:border-brand-primary border-b-0" 
                            />
                        </div>
                        <div className="max-h-40 overflow-y-auto border border-dark-border rounded-b-lg bg-gray-900 p-2 grid grid-cols-1 gap-2">
                            {filteredAttendees.map(a => (
                                <label key={a.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 p-1 rounded">
                                    <input 
                                        type="checkbox" 
                                        checked={(currentItem.attendeeIds || []).includes(a.id)} 
                                        onChange={() => toggleAttendeeSelection(a.id)}
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-primary focus:ring-brand-secondary"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm text-white font-medium">{a.name}</span>
                                        <span className="text-xs text-gray-500">{a.type}</span>
                                    </div>
                                </label>
                            ))}
                            {filteredAttendees.length === 0 && <p className="text-sm text-gray-500 italic p-2">No attendees found matching '{attendeeSearch}'.</p>}
                        </div>
                    </div>

                    {/* Task/Role Name */}
                     <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">{activeTab === 'staff' ? 'Role' : 'Task'}</label>
                        <input 
                            type="text" 
                            name={activeTab === 'staff' ? 'role' : 'task'} 
                            value={activeTab === 'staff' ? currentItem.role : currentItem.task} 
                            onChange={handleFormChange} 
                            required 
                            className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary" 
                        />
                    </div>

                    {commonTimeFields}

                    {/* Location Search & Select */}
                     <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Location(s)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                             <input 
                                type="text" 
                                placeholder="Type to search locations..." 
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-dark-border rounded-t-lg text-white focus:ring-brand-primary focus:border-brand-primary border-b-0" 
                            />
                        </div>
                         <div className="max-h-40 overflow-y-auto border border-dark-border rounded-b-lg bg-gray-900 p-2 grid grid-cols-1 gap-2">
                            {filteredLocations.map(loc => (
                                <label key={loc} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 p-1 rounded">
                                    <input 
                                        type="checkbox" 
                                        checked={(currentItem.locations || []).includes(loc)} 
                                        onChange={() => toggleLocationSelection(loc)}
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-primary focus:ring-brand-secondary"
                                    />
                                    <span className="text-sm text-white">{loc}</span>
                                </label>
                            ))}
                            {filteredLocations.length === 0 && <p className="text-sm text-gray-500 italic p-2">No locations found matching '{locationSearch}'.</p>}
                        </div>
                    </div>
                </>
            );
        }
    };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Programmes</h1>
        {activeTab !== 'all' && activeTab !== 'personal' && (
            <button onClick={() => openModal()} className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors">
            Add to Programme
            </button>
        )}
      </div>
      
      <div className="border-b border-dark-border">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
            <TabButton label="Master Schedule" name="all" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton label="My Schedule" name="personal" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton label="Event Programme" name="events" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton label="Staff Programme" name="staff" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton label="Volunteer Programme" name="volunteers" activeTab={activeTab} onClick={setActiveTab} />
        </nav>
      </div>

      <div className="bg-dark-card rounded-lg shadow overflow-hidden">
        {renderContent()}
      </div>

      {isModalOpen && currentItem && activeTab !== 'all' && activeTab !== 'personal' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">{currentItem.id ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderModalFields()}
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

export default ProgrammesPage;

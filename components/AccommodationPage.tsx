
import React, { useState } from 'react';
import { Accommodation, Attendee } from '../types';
import { DeleteIcon } from './icons/DeleteIcon';

interface AccommodationPageProps {
  accommodations: Accommodation[];
  attendees: Attendee[];
  onAssign: (accommodationId: string, attendeeId: string) => void;
  onRemove: (accommodationId: string, attendeeId: string) => void;
}

const AccommodationPage: React.FC<AccommodationPageProps> = ({ accommodations, attendees, onAssign, onRemove }) => {
    const [selectedAttendee, setSelectedAttendee] = useState<string>('');
    const [targetAccommodation, setTargetAccommodation] = useState<string>(accommodations[0]?.id || '');

    const handleAssign = () => {
        if (selectedAttendee && targetAccommodation) {
            onAssign(targetAccommodation, selectedAttendee);
            setSelectedAttendee(''); // Reset selection
        }
    };

    // Helper to find attendee details
    const getAttendee = (id: string) => attendees.find(a => a.id === id);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Accommodation Management</h1>

            {/* Assignment Panel */}
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Assign Attendee to Accommodation</h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Select Attendee</label>
                         <select 
                            value={selectedAttendee} 
                            onChange={e => setSelectedAttendee(e.target.value)} 
                            className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="">-- Choose Person --</option>
                            {attendees
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Select Unit</label>
                         <select 
                            value={targetAccommodation} 
                            onChange={e => setTargetAccommodation(e.target.value)} 
                            className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                        >
                            {accommodations.map(acc => {
                                const isFull = acc.attendeeIds.length >= acc.capacity;
                                return (
                                    <option key={acc.id} value={acc.id} disabled={isFull}>
                                        {acc.name} ({acc.attendeeIds.length}/{acc.capacity} slots) {isFull ? '- FULL' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <button 
                        onClick={handleAssign}
                        disabled={!selectedAttendee || !targetAccommodation}
                        className="w-full md:w-auto px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Assign
                    </button>
                </div>
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {accommodations.map(acc => (
                    <div key={acc.id} className="bg-dark-card rounded-xl overflow-hidden border border-dark-border shadow flex flex-col">
                        <div className="p-4 bg-gray-800/50 border-b border-dark-border flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">{acc.name}</h3>
                                <p className="text-xs text-brand-primary uppercase tracking-wider font-bold">{acc.type}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-sm font-medium px-2 py-1 rounded ${acc.attendeeIds.length >= acc.capacity ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {acc.attendeeIds.length} / {acc.capacity} Occupied
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex-1">
                            {acc.attendeeIds.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-dark-text-secondary text-sm italic py-8">
                                    No occupants assigned.
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {acc.attendeeIds.map(id => {
                                        const person = getAttendee(id);
                                        if (!person) return null;
                                        return (
                                            <li key={id} className="flex items-center justify-between p-2 bg-gray-900 rounded-lg border border-dark-border">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{person.name}</span>
                                                    <span className="text-xs text-dark-text-secondary">{person.type}</span>
                                                </div>
                                                <button 
                                                    onClick={() => onRemove(acc.id, id)}
                                                    className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-500/10 transition-colors"
                                                    title="Remove from accommodation"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccommodationPage;

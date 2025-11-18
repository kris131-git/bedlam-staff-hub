
import React, { useState } from 'react';
import AttendeesPage from './AttendeesPage';
import ProgrammesPage from './ProgrammesPage';
import StaffManagementPage from './StaffManagementPage';
import RegistrationPage from './RegistrationPage';
import AccommodationPage from './AccommodationPage';
import TillPage from './TillPage';
import HomePage from './HomePage';
import { User, UserRole, Attendee, ProgrammeEvent, StaffShift, VolunteerShift, Accommodation, Product, Transaction, CartItem, PaymentMethod, BulletinMessage } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { UsersIcon } from './icons/UsersIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { HomeIcon } from './icons/HomeIcon';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  // Users
  users: User[];
  onCreateUser: (newUser: User) => Promise<{ success: boolean; message?: string }>;
  onUpdateUser: (updatedUser: User) => Promise<{ success: boolean; message?: string }>;
  onDeleteUser: (username: string) => void;
  // Attendees
  attendees: Attendee[];
  onCreateAttendee: (attendee: Omit<Attendee, 'id'>) => void;
  onUpdateAttendee: (attendee: Attendee) => void;
  onDeleteAttendee: (id: string) => void;
  onCheckInAttendee: (id: string) => void;
  onUncheckInAttendee: (id: string) => void;
  // Events
  events: ProgrammeEvent[];
  onCreateEvent: (event: Omit<ProgrammeEvent, 'id'>) => void;
  onUpdateEvent: (event: ProgrammeEvent) => void;
  onDeleteEvent: (id: string) => void;
  // Staff Shifts
  staffShifts: StaffShift[];
  onCreateStaffShift: (shift: Omit<StaffShift, 'id'>) => void;
  onUpdateStaffShift: (shift: StaffShift) => void;
  onDeleteStaffShift: (id: string) => void;
  // Volunteer Shifts
  volunteerShifts: VolunteerShift[];
  onCreateVolunteerShift: (shift: Omit<VolunteerShift, 'id'>) => void;
  onUpdateVolunteerShift: (shift: VolunteerShift) => void;
  onDeleteVolunteerShift: (id: string) => void;
  // Accommodation
  accommodations: Accommodation[];
  onAssignAccommodation: (accommodationId: string, attendeeId: string) => void;
  onRemoveAccommodation: (accommodationId: string, attendeeId: string) => void;
  // Till
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  transactions: Transaction[];
  onProcessTransaction: (items: CartItem[], total: number, method: PaymentMethod) => void;
  // Bulletins
  bulletins: BulletinMessage[];
  onCreateBulletin: (msg: Omit<BulletinMessage, 'id' | 'timestamp'>) => void;
  onDeleteBulletin: (id: string) => void;
}

type View = 'home' | 'attendees' | 'programmes' | 'staffManagement' | 'registration' | 'accommodation' | 'till';

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { user, onLogout, users, onCreateUser, onUpdateUser, onDeleteUser } = props;
  const [activeView, setActiveView] = useState<View>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavClick = (view: View) => {
    setActiveView(view);
    setIsSidebarOpen(false); // Close sidebar on mobile when a link is clicked
  };

  const NavItem = ({ icon, label, view, active }: { icon: React.ReactNode, label: string, view: View, active: boolean }) => (
    <button
      onClick={() => handleNavClick(view)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-md ${
        active ? 'bg-brand-primary text-white' : 'text-dark-text hover:bg-dark-border hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-dark-card border-r border-dark-border flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 md:h-20 border-b border-dark-border p-4">
          <button onClick={() => handleNavClick('home')} className="text-xl font-bold text-white leading-tight hover:text-brand-primary transition-colors text-left">Bedlam Ball<br/><span className="text-xs font-normal text-dark-text-secondary">Staff Hub</span></button>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden text-dark-text-secondary hover:text-white p-1"
          >
            <XIcon />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          <NavItem icon={<HomeIcon />} label="Home" view="home" active={activeView === 'home'} />
          <NavItem icon={<UserGroupIcon />} label="Attendees" view="attendees" active={activeView === 'attendees'} />
          <NavItem icon={<ClipboardCheckIcon />} label="Registration" view="registration" active={activeView === 'registration'} />
          <NavItem icon={<CalendarDaysIcon />} label="Programmes" view="programmes" active={activeView === 'programmes'} />
          <NavItem icon={<HomeIcon />} label="Accommodation" view="accommodation" active={activeView === 'accommodation'} />
          <NavItem icon={<CurrencyDollarIcon />} label="Bar Till" view="till" active={activeView === 'till'} />
          {user.role === UserRole.Admin && (
            <NavItem icon={<UsersIcon />} label="Staff Management" view="staffManagement" active={activeView === 'staffManagement'} />
          )}
        </nav>
        
        <div className="px-2 py-4 border-t border-dark-border bg-dark-card">
           <div className="px-4 py-3 mb-2">
                <p className="text-sm font-medium text-white">Welcome, {user.username}</p>
                <p className="text-xs text-dark-text-secondary">{user.role}</p>
            </div>
          <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-dark-text hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200 rounded-md">
            <LogoutIcon />
            <span className="ml-4">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-dark-card border-b border-dark-border p-4 shrink-0">
            <h1 className="text-lg font-bold text-white truncate">Bedlam Ball Staff Hub</h1>
            <button onClick={() => setIsSidebarOpen(true)} className="text-white p-1">
                <MenuIcon />
            </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
            {activeView === 'home' && (
                <HomePage 
                    user={user}
                    users={props.users} // Passing users for the selector
                    attendees={props.attendees}
                    events={props.events}
                    staffShifts={props.staffShifts}
                    volunteerShifts={props.volunteerShifts}
                    transactions={props.transactions}
                    bulletins={props.bulletins}
                    onCreateBulletin={props.onCreateBulletin}
                    onDeleteBulletin={props.onDeleteBulletin}
                />
            )}
            {activeView === 'attendees' && <AttendeesPage attendees={props.attendees} onCreate={props.onCreateAttendee} onUpdate={props.onUpdateAttendee} onDelete={props.onDeleteAttendee} />}
            {activeView === 'registration' && <RegistrationPage attendees={props.attendees} onCheckIn={props.onCheckInAttendee} onUncheckIn={props.onUncheckInAttendee} />}
            {activeView === 'programmes' && <ProgrammesPage {...props} currentUser={user} />}
            {activeView === 'accommodation' && <AccommodationPage accommodations={props.accommodations} attendees={props.attendees} onAssign={props.onAssignAccommodation} onRemove={props.onRemoveAccommodation} />}
            {activeView === 'till' && (
              <TillPage 
                products={props.products}
                onAddProduct={props.onAddProduct}
                transactions={props.transactions}
                onProcessTransaction={props.onProcessTransaction}
              />
            )}
            {activeView === 'staffManagement' && <StaffManagementPage user={user} users={users} onCreateUser={onCreateUser} onUpdateUser={onUpdateUser} onDeleteUser={onDeleteUser} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

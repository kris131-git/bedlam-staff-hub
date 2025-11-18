
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface StaffManagementPageProps {
    user: User; // Currently logged-in user
    users: User[];
    onCreateUser: (newUser: User) => Promise<{ success: boolean; message?: string }>;
    onUpdateUser: (updatedUser: User) => Promise<{ success: boolean; message?: string }>;
    onDeleteUser: (username: string) => void;
}

const StaffManagementPage: React.FC<StaffManagementPageProps> = ({ user, users, onCreateUser, onUpdateUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [password, setPassword] = useState(''); // Separate state for password changes
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const openModal = (userToEdit: User | null) => {
        if (userToEdit) {
            setCurrentUser({ ...userToEdit });
            setPassword(''); // Don't pre-fill password
        } else {
            setCurrentUser({ username: '', password: '', role: UserRole.Staff });
            setPassword('');
        }
        setIsModalOpen(true);
        setError(null);
        setSuccess(null);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setPassword('');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!currentUser) return;

        const isNewUser = !users.some(u => u.username === currentUser.username);

        if (isNewUser) { // Create user
            if (!currentUser.username.trim() || !password.trim()) {
                setError("Username and password cannot be empty for new users.");
                return;
            }
            const result = await onCreateUser({ ...currentUser, password: password });
            if (result.success) {
                setSuccess(`User "${currentUser.username}" created successfully!`);
                closeModal();
            } else {
                setError(result.message || "Failed to create user.");
            }
        } else { // Update user
            const finalUser = { ...currentUser };
            if (password.trim()) {
                finalUser.password = password.trim();
            }
            const result = await onUpdateUser(finalUser);
            if (result.success) {
                setSuccess(`User "${currentUser.username}" updated successfully!`);
                closeModal();
            } else {
                setError(result.message || "Failed to update user.");
            }
        }
    };
    
    const handleDelete = (username: string) => {
        if (username === user.username) {
            alert("You cannot delete your own account.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            onDeleteUser(username);
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentUser(prev => prev ? { ...prev, [name]: value } : null);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Staff Management</h1>
              <button onClick={() => openModal(null)} className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors">
                Add New Staff
              </button>
            </div>

            <div className="bg-dark-card rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-gray-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                        {users.map(u => (
                            <tr key={u.username} className="hover:bg-dark-border/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">{u.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    <button onClick={() => openModal(u)} className="text-brand-primary hover:text-brand-secondary p-1"><EditIcon /></button>
                                    <button onClick={() => handleDelete(u.username)} className={`p-1 ml-2 ${u.username === user.username ? 'text-gray-600 cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`} disabled={u.username === user.username}><DeleteIcon /></button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && currentUser && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-dark-card rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-6">{users.some(u=> u.username === currentUser.username) ? 'Edit' : 'Add'} Staff Member</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={currentUser.username}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                                    required
                                    readOnly={users.some(u => u.username === currentUser.username)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={users.some(u => u.username === currentUser.username) ? 'Leave blank to keep unchanged' : ''}
                                    className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                                    required={!users.some(u => u.username === currentUser.username)}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Role</label>
                                <select
                                    name="role"
                                    value={currentUser.role}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                                    disabled={currentUser.username === user.username}
                                >
                                    <option value={UserRole.Staff}>Staff</option>
                                    <option value={UserRole.Admin}>Admin</option>
                                </select>
                            </div>

                            {error && <p className="text-sm text-red-400">{error}</p>}
                            {success && <p className="text-sm text-green-400">{success}</p>}
                            
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

export default StaffManagementPage;

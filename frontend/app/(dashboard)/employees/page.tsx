/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { User } from '@/lib/types';
import EmployeeModal from '@/components/employees/EmployeeModal';
import EmployeeTable from '@/components/employees/EmployeeTable';

const DEFAULT_FORM_DATA = {
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    password: '',
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAllUsers();
            setEmployees(res.data.filter((user: User) => !user.deleted));
        } catch (err: any) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (employee?: User) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                role: employee.role,
                department: employee.department || '',
                password: '',
            });
        } else {
            setEditingEmployee(null);
            setFormData(DEFAULT_FORM_DATA);
        }
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
        setFormData(DEFAULT_FORM_DATA);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (editingEmployee) {
                await userAPI.updateUser(editingEmployee._id, formData);
                await loadEmployees();
                handleCloseModal();
            } else {
                await userAPI.createUser(formData);
                alert('Employee created successfully, setup instructions have been sent via email.');
                await loadEmployees();
                handleCloseModal();
            }
        } catch (err: any) {
            setError(err.message || 'Unexpected error occurred');
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this employee?')) return;

        try {
            await userAPI.deleteUser(id);
            await loadEmployees();
        } catch (err: any) {
            alert(err.message || 'Unexpected error occurred');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Add Employee
                </button>
            </div>

            <EmployeeTable
                employees={employees}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <EmployeeModal
                show={showModal}
                editingEmployee={editingEmployee}
                formData={formData}
                error={error}
                submitting={submitting}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                onChange={setFormData}
            />
        </div>
    );
}

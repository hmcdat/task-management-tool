'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { User } from '@/lib/types';
import Table, { TableColumn, TableAction } from '@/components/common/Table';

interface EmployeeTableProps {
    employees: User[];
    onEdit: (employee: User) => void;
    onDelete: (id: string) => void;
}

export default function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
    const getRoleBadge = (role: string) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            manager: 'bg-yellow-100 text-yellow-800',
            employee: 'bg-green-100 text-green-800',
        };
        return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const columns: TableColumn<User>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (employee) => (
                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
            ),
        },
        {
            key: 'username',
            header: 'Username',
            render: (employee) => (
                <div className="text-sm text-gray-500">{employee.username || '(not setup)'}</div>
            ),
        },
        {
            key: 'email',
            header: 'Email',
            render: (employee) => (
                <div className="text-sm text-gray-500">{employee.email}</div>
            ),
        },
        {
            key: 'phone',
            header: 'Phone',
            render: (employee) => (
                <div className="text-sm text-gray-500">{employee.phone}</div>
            ),
        },
        {
            key: 'department',
            header: 'Department',
            render: (employee) => (
                <div className="text-sm text-gray-500">{employee.department || '-'}</div>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (employee) => (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(employee.role)}`}>
                    {employee.role}
                </span>
            ),
        },
    ];

    const actions: TableAction<User>[] = [
        {
            icon: <Pencil className="w-4 h-4" />,
            onClick: onEdit,
            className: 'text-indigo-600 hover:text-indigo-900 inline-flex items-center cursor-pointer',
        },
        {
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (employee) => onDelete(employee._id),
            className: 'text-red-600 hover:text-red-900 inline-flex items-center cursor-pointer',
        },
    ];

    return (
        <Table
            data={employees}
            columns={columns}
            actions={actions}
            keyExtractor={(employee) => employee._id}
            emptyMessage='No employees found. Click "Add Employee" to create one.'
        />
    );
}

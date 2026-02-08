'use client';

import React from 'react';
import { User } from '@/lib/types';
import Modal from '@/components/common/Modal';

interface AssignModalProps {
    show: boolean;
    taskId: string;
    currentAssignees: string[];
    employees: User[];
    submitting: boolean;
    onClose: () => void;
    onAssign: (taskId: string, assignees: string[]) => void;
}

export default function AssignModal({
    show,
    taskId,
    currentAssignees,
    employees,
    submitting,
    onClose,
    onAssign,
}: AssignModalProps) {
    const [selectedEmployees, setSelectedEmployees] = React.useState<string[]>(currentAssignees);

    React.useEffect(() => {
        setSelectedEmployees(currentAssignees);
    }, [currentAssignees]);

    const handleToggle = (employeeId: string) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAssign(taskId, selectedEmployees);
    };

    return (
        <Modal
            show={show}
            title="Assign Employees"
            onClose={onClose}
            size="md"
        >
            <form onSubmit={handleSubmit}>
                    <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                        {employees.map((employee) => (
                            <label
                                key={employee._id}
                                className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedEmployees.includes(employee._id)}
                                    onChange={() => handleToggle(employee._id)}
                                    className="mr-3 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                    <div className="text-xs text-gray-500">{employee.email}</div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    employee.role === 'admin' ? 'bg-red-100 text-red-800' :
                                    employee.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {employee.role}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? 'Assigning...' : 'Assign'}
                        </button>
                    </div>
                </form>
        </Modal>
    );
}

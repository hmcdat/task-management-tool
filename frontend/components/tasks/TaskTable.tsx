'use client';

import { Pencil, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { Task, User } from '@/lib/types';

interface TaskTableProps {
    tasks: Task[];
    employees: User[];
    isManager: boolean;
    currentUserId: string;
    onEdit?: (task: Task) => void;
    onAssign?: (taskId: string) => void;
    onToggleStatus: (taskId: string, currentStatus: boolean) => void;
}

export default function TaskTable({ 
    tasks, 
    employees, 
    isManager, 
    currentUserId, 
    onEdit, 
    onAssign, 
    onToggleStatus 
}: TaskTableProps) {
    const getAssignedEmployees = (assignees: string[]) => {
        return employees.filter(e => assignees.includes(e._id));
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => {
                        const assignedEmployees = getAssignedEmployees(task.assignees);
                        const canEdit = isManager || task.assignees.includes(currentUserId);
                        
                        return (
                            <tr key={task._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium ${task.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                        {task.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-xs">
                                        {task.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {assignedEmployees.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {assignedEmployees.map((emp) => (
                                                <span
                                                    key={emp._id}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                >
                                                    {emp.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-sm">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        task.done ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {task.done ? 'Done' : 'Undone'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {canEdit && (
                                        <>
                                            {isManager && onEdit && (
                                                <button
                                                    onClick={() => onEdit(task)}
                                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center cursor-pointer"
                                                    title="Edit task"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isManager && onAssign && (
                                                <button
                                                    onClick={() => onAssign(task._id)}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center cursor-pointer"
                                                    title="Assign employees"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onToggleStatus(task._id, task.done)}
                                                className={`inline-flex items-center cursor-pointer ${
                                                    task.done
                                                        ? 'text-yellow-600 hover:text-yellow-900'
                                                        : 'text-green-600 hover:text-green-900'
                                                }`}
                                                title={task.done ? 'Mark as undone' : 'Mark as done'}
                                            >
                                                {task.done ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                No tasks found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}


/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { taskAPI, userAPI } from '@/lib/api';
import { Task, User } from '@/lib/types';
import { useUser } from '@/contexts/UserContext';
import TaskModal from '@/components/tasks/TaskModal';
import AssignModal from '@/components/tasks/AssignModal';
import TaskTable from '@/components/tasks/TaskTable';

const DEFAULT_FORM_DATA = {
    title: '',
    description: '',
    dueDate: '',
};

export default function TasksPage() {
    const { user } = useUser();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [assigningTaskId, setAssigningTaskId] = useState<string>('');
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isManager = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => {
        loadTasks();
        if (isManager) {
            loadEmployees();
        }
    }, [isManager]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const res = await taskAPI.getTasks();
            setTasks(res.data);
        } catch (err: any) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async () => {
        try {
            const res = await userAPI.getAllUsers();
            setEmployees(res.data.filter((u: User) => !u.deleted));
        } catch (err: any) {
            console.log(err);
        }
    };

    const handleOpenTaskModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                dueDate: '',
            });
        } else {
            setEditingTask(null);
            setFormData(DEFAULT_FORM_DATA);
        }
        setError('');
        setShowTaskModal(true);
    };

    const handleCloseTaskModal = () => {
        setShowTaskModal(false);
        setEditingTask(null);
        setFormData(DEFAULT_FORM_DATA);
        setError('');
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (editingTask) {
                await taskAPI.updateTask(editingTask._id, {
                    title: formData.title,
                    description: formData.description,
                });
                await loadTasks();
                handleCloseTaskModal();
            } else {
                await taskAPI.createTask({
                    ...formData,
                    assignees: [],
                });
                await loadTasks();
                handleCloseTaskModal();
            }
        } catch (err: any) {
            setError(err.message || 'Unexpected error occurred');
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenAssignModal = (taskId: string) => {
        setAssigningTaskId(taskId);
        setShowAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
        setAssigningTaskId('');
    };

    const handleAssign = async (taskId: string, assignees: string[]) => {
        setSubmitting(true);
        try {
            await taskAPI.assignEmployees(taskId, assignees);
            await loadTasks();
            handleCloseAssignModal();
        } catch (err: any) {
            alert(err.message || 'Assign failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (taskId: string, currentStatus: boolean) => {
        try {
            await taskAPI.markTaskStatus(taskId, currentStatus ? 'undone' : 'done');
        } catch (err: any) {
            alert(err.message || 'Status update failed');
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
                <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                {isManager && (
                    <button
                        onClick={() => handleOpenTaskModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        Create Task
                    </button>
                )}
            </div>

            <TaskTable
                tasks={tasks}
                employees={employees}
                isManager={isManager}
                currentUserId={user?._id || ''}
                onEdit={handleOpenTaskModal}
                onAssign={handleOpenAssignModal}
                onToggleStatus={handleToggleStatus}
            />

            <TaskModal
                show={showTaskModal}
                editingTask={editingTask}
                formData={formData}
                error={error}
                submitting={submitting}
                onClose={handleCloseTaskModal}
                onSubmit={handleSubmitTask}
                onChange={setFormData}
            />

            {assigningTaskId && (
                <AssignModal
                    show={showAssignModal}
                    taskId={assigningTaskId}
                    currentAssignees={tasks.find(t => t._id === assigningTaskId)?.assignees || []}
                    employees={employees}
                    submitting={submitting}
                    onClose={handleCloseAssignModal}
                    onAssign={handleAssign}
                />
            )}
        </div>
    );
}

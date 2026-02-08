/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Modal from '@/components/common/Modal';

interface TaskModalProps {
    show: boolean;
    editingTask: any;
    formData: {
        title: string;
        description: string;
        dueDate: string;
    };
    error: string;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onChange: (data: any) => void;
}

export default function TaskModal({
    show,
    editingTask,
    formData,
    error,
    submitting,
    onClose,
    onSubmit,
    onChange,
}: TaskModalProps) {
    return (
        <Modal
            show={show}
            title={editingTask ? 'Edit Task' : 'Create New Task'}
            onClose={onClose}
            size="md"
        >
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => onChange({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => onChange({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {!editingTask && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={(e) => onChange({ ...formData, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
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
                            {submitting ? 'Saving...' : editingTask ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
        </Modal>
    );
}

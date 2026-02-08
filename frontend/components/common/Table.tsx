/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { ReactNode } from 'react';

export interface TableColumn<T = any> {
    key: string;
    header: string;
    render: (item: T) => ReactNode;
    className?: string;
}

export interface TableAction<T = any> {
    icon: ReactNode;
    onClick: (item: T) => void;
    className?: string;
    title?: string;
}

interface TableProps<T = any> {
    data: T[];
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    emptyMessage?: string;
    keyExtractor: (item: T) => string;
}

export default function Table<T = any>({ 
    data, 
    columns, 
    actions, 
    emptyMessage = 'No data found',
    keyExtractor 
}: TableProps<T>) {
    const totalColumns = columns.length + (actions && actions.length > 0 ? 1 : 0);

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th 
                                key={column.key}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                            >
                                {column.header}
                            </th>
                        ))}
                        {actions && actions.length > 0 && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={keyExtractor(item)}>
                            {columns.map((column) => (
                                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                    {column.render(item)}
                                </td>
                            ))}
                            {actions && actions.length > 0 && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {actions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => action.onClick(item)}
                                            className={action.className || 'inline-flex items-center cursor-pointer'}
                                            title={action.title}
                                        >
                                            {action.icon}
                                        </button>
                                    ))}
                                </td>
                            )}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={totalColumns} className="px-6 py-8 text-center text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

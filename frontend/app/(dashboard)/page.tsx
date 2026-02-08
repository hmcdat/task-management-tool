'use client';

import { CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
    const { user: userData, isLoading } = useUser();

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center min-h-75">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Welcome{userData?.name ? ` ${userData.name}` : ''} to Task Management Tool
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You are now logged in! This is a protected page that requires authentication.
                    </p>

                    {userData && (
                        <div className="mb-6 p-6 bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                            <h3 className="text-lg font-semibold text-indigo-900 mb-4">User Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-md shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Name</p>
                                    <p className="text-base font-medium text-gray-900">{userData.name}</p>
                                </div>
                                <div className="bg-white p-4 rounded-md shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="text-base font-medium text-gray-900">{userData.email}</p>
                                </div>
                                <div className="bg-white p-4 rounded-md shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                                    <p className="text-base font-medium text-gray-900">{userData.phone || 'N/A'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-md shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Role</p>
                                    <p className="text-base font-medium text-gray-900 capitalize">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userData.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            userData.role === 'manager' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {userData.role}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                            <div className="shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    Authentication is working! Try logging out and you&apos;ll be redirected to the login page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


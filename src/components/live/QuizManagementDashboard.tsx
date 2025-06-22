import React, { useState } from 'react';
import CreateLiveQuiz from './CreateLiveQuiz'; // Adjust path if needed
import ManageQuizzes from './ManageLiveQuizzes'; // Adjust path if needed
import { useAuth } from '../../contexts/AuthContext';

const QuizManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create'); // Default to 'create'
  const { isAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="text-center text-blue-500 mt-12 text-xl">Loading authentication...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center text-red-600 mt-12 p-8 bg-red-50 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You do not have administrative privileges to access this dashboard.</p>
        <p>Please log in with an administrator account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Admin Quiz Dashboard</h1>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
          <button
            className={`py-3 px-8 text-lg font-medium rounded-t-lg transition-colors duration-200
              ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('create')}
          >
            Create New Quiz
          </button>
          <button
            className={`py-3 px-8 text-lg font-medium rounded-t-lg transition-colors duration-200
              ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Existing Quizzes
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-xl p-6">
          {activeTab === 'create' && <CreateLiveQuiz />}
          {activeTab === 'manage' && <ManageQuizzes />}
        </div>
      </div>
    </div>
  );
};

export default QuizManagementDashboard;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { LiveQuizData, getAllUnarchivedLiveQuizzesFromFirestore } from '../../services/firestore/liveQuizServices';


const LiveTest: React.FC = () => {
  const [quizzes, setQuizzes] = useState<LiveQuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedQuizzes = await getAllUnarchivedLiveQuizzesFromFirestore();
        // Optionally sort them, e.g., by creation date
        fetchedQuizzes.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setQuizzes(fetchedQuizzes);
        if (fetchedQuizzes.length === 0) {
          setError('No active live tests are currently available.');
        }
      } catch (err) {
        console.error("Error fetching live tests:", err);
        setError("Failed to load live tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []); // Empty dependency array means this runs once on component mount

  const handleAttendTest = (quizId: string) => {
    navigate(`/student/quiz/${quizId}`); // Navigate to the quiz player route
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-blue-600">Loading live tests...</p>
      </div>
    );
  }

  if (error && quizzes.length === 0) { // Only show error if no quizzes were loaded at all
    return (
      <div className="flex justify-center items-center h-64 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) { // Specific message if no quizzes found after loading
    return (
      <div className="flex justify-center items-center h-64 p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">No Tests:</strong>
          <span className="block sm:inline ml-2">No active live tests available at the moment. Please check back later!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center">Available Live Tests</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div 
            key={quiz.details.id} 
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-blue-200 hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-3">{quiz.details.title}</h2>
              <p className="text-gray-700 mb-2">
                <strong>Grade:</strong> <span className="font-semibold">{quiz.details.grade}</span>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Time Limit:</strong> <span className="font-semibold">{quiz.details.timeLimit} minutes</span>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Questions:</strong> <span className="font-semibold">{quiz.questions.length}</span>
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Audience:</strong> <span className="font-semibold">{quiz.details.targetAudience.charAt(0).toUpperCase() + quiz.details.targetAudience.slice(1)}</span>
              </p>

              <button
                onClick={() => handleAttendTest(quiz.details.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Attend Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveTest;
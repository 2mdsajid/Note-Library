import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saveLiveQuizToFirestore } from '../../services/firestore/liveQuizServices';
import { QuizDetails, QuizQuestion } from '../admin/TestingQuizzes';

// If QuizDetails and QuizQuestion are in a separate types file, adjust the import path:
// import { QuizDetails, QuizQuestion } from '../../types/quizTypes'; // Example path

const CreateLiveQuiz: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth(); // Get currentUser and auth loading state
  const [quizDetails, setQuizDetails] = useState<QuizDetails>({
    id: '', // Will be generated on submit
    title: '',
    grade: '',
    timeLimit: 0,
    targetAudience: 'authenticated', // Default value
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Basic validation to ensure it's an array of questions
          if (Array.isArray(data) && data.every(item => 'id' in item && 'question' in item)) {
            setQuizQuestions(data as QuizQuestion[]);
            setFileError(null);
          } else {
            setFileError('Invalid JSON format. Expected an array of quiz questions.');
            setQuizQuestions([]);
          }
        } catch (err) {
          setFileError('Invalid JSON file. Please ensure it\'s well-formed JSON.');
          setQuizQuestions([]);
        }
      };
      reader.readAsText(file);
    } else {
      setQuizQuestions([]);
      setFileError(null);
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuizDetails(prevDetails => ({
      ...prevDetails,
      [name]: name === 'timeLimit' ? parseInt(value) : value, // Convert timeLimit to number
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (authLoading || !currentUser) {
      setFormError("Authentication not loaded or user not logged in.");
      return;
    }

    if (!quizDetails.title || !quizDetails.grade || quizDetails.timeLimit <= 0) {
      setFormError("Please fill in all quiz details (Title, Grade, Time Limit).");
      return;
    }

    if (quizQuestions.length === 0) {
      setFormError("Please upload a JSON file with quiz questions.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate a unique ID for the quiz
      const newQuizId = `quiz_${Date.now()}`; // Simple timestamp ID, consider UUID for robustness

      const finalQuizData  = {
        details: { ...quizDetails, id: newQuizId }, // Attach the generated ID to details
        questions: quizQuestions,
        type:'live'
      };

      const quizId = await saveLiveQuizToFirestore(finalQuizData, currentUser.uid);
      setSuccessMessage(`Quiz "${quizDetails.title}" added/updated successfully with ID: ${quizId}`);

      // Optionally reset the form after successful submission
      setQuizDetails({
        id: '',
        title: '',
        grade: '',
        timeLimit: 0,
        targetAudience: 'authenticated',
      });
      setQuizQuestions([]);
      // You might want to clear the file input as well, tricky with React state
      // For now, the user can just re-select.

    } catch (error) {
      console.error("Error saving quiz:", error);
      setFormError(`Failed to save quiz: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-3">Create New Quiz</h1>

      {authLoading && <div className="text-center text-blue-500 mb-4">Loading authentication...</div>}
      {!currentUser && !authLoading && <div className="text-center text-red-500 mb-4">You must be logged in to create a quiz.</div>}

      {/* Quiz Details Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-md shadow-inner">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Quiz Details</h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Quiz Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={quizDetails.title}
              onChange={handleDetailsChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade/Category:</label>
            <select
              id="grade"
              name="grade"
              value={quizDetails.grade}
              onChange={handleDetailsChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Grade/Category</option>
              <option value="IOE">IOE</option>
              <option value="CEE">CEE</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
              <option value="None">None</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">Time Limit (minutes):</label>
            <input
              type="number"
              id="timeLimit"
              name="timeLimit"
              value={quizDetails.timeLimit}
              onChange={handleDetailsChange}
              required
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">Target Audience:</label>
            <select
              id="targetAudience"
              name="targetAudience"
              value={quizDetails.targetAudience}
              onChange={handleDetailsChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="authenticated">Authenticated Users Only</option>
              <option value="all">All Users (Authenticated & Non-Authenticated)</option>
              <option value="non-authenticated">Non-Authenticated Users Only</option>
            </select>
          </div>
        </div>

        {/* JSON Upload Section */}
        <div className="bg-gray-50 p-6 rounded-md shadow-inner">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Quiz Questions (JSON)</h2>
          <div className="mb-4">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {fileError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {fileError}
            </div>
          )}

          {quizQuestions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Parsed {quizQuestions.length} Questions:
              </h3>
              <div className="max-h-60 overflow-y-auto bg-gray-100 p-3 rounded text-sm text-gray-700">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(quizQuestions.slice(0, 5), null, 2)} {/* Show first 5 questions for brevity */}
                  {quizQuestions.length > 5 && (
                    <p className="text-center text-gray-500 mt-2">...and {quizQuestions.length - 5} more questions</p>
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Submission Feedback */}
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || authLoading || !currentUser || quizQuestions.length === 0 || !quizDetails.title || quizDetails.timeLimit <= 0}
          className={`w-full py-3 px-6 rounded-md text-lg font-semibold transition duration-300
            ${isSubmitting || !currentUser || quizQuestions.length === 0 || !quizDetails.title || quizDetails.timeLimit <= 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
            }`}
        >
          {isSubmitting ? 'Submitting Quiz...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
};

export default CreateLiveQuiz;
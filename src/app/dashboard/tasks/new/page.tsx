"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { parseNaturalLanguageTask, suggestSubtasks, createSubtasksFromSuggestions } from '@/lib/ai-service';

interface SuggestedTask {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date | null;
}

export default function NewTaskPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [taskCreated, setTaskCreated] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
  });

  const handleNaturalLanguageSubmit = () => {
    if (!naturalLanguageInput.trim()) return;
    
    const parsedTask = parseNaturalLanguageTask(naturalLanguageInput);
    
    setFormData({
      title: parsedTask.title,
      description: parsedTask.description || '',
      dueDate: parsedTask.dueDate ? parsedTask.dueDate.toISOString().split('T')[0] : '',
      priority: parsedTask.priority || 'medium',
      status: 'pending',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateSubtaskSuggestions = async () => {
    if (!formData.title) {
      setError('Please enter a task title first');
      return;
    }

    try {
      const taskSuggestions = await suggestSubtasks(
        formData.title,
        formData.description,
        currentUser?.uid
      );
      
      setSuggestions(taskSuggestions);
      setShowSuggestions(true);
      setSelectedSuggestions(taskSuggestions.map(s => s.title)); // Select all by default
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError('Failed to generate task suggestions');
    }
  };

  const toggleSuggestion = (title: string) => {
    setSelectedSuggestions(prev => {
      if (prev.includes(title)) {
        return prev.filter(t => t !== title);
      } else {
        return [...prev, title];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to create a task');
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate ? Timestamp.fromDate(new Date(formData.dueDate)) : null,
        priority: formData.priority,
        status: formData.status,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      setCreatedTaskId(docRef.id);
      
      // If there are selected suggestions, create subtasks
      if (showSuggestions && selectedSuggestions.length > 0) {
        const filteredSuggestions = suggestions.filter(s => 
          selectedSuggestions.includes(s.title)
        );
        
        await createSubtasksFromSuggestions(docRef.id, currentUser.uid, filteredSuggestions);
      }
      
      setTaskCreated(true);
    } catch (error: any) {
      console.error('Error creating task:', error);
      setError(error.message || 'Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard/tasks');
  };

  if (taskCreated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Task Created</h1>
        </div>

        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-200">
          Your task "{formData.title}" has been created successfully.
          {selectedSuggestions.length > 0 && (
            <p className="mt-2">
              {selectedSuggestions.length} subtasks have been created.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Link href={`/dashboard/tasks/${createdTaskId}`}>
            <Button variant="outline">
              View Task
            </Button>
          </Link>
          <Button onClick={handleFinish}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Create New Task</h1>
        <Link href="/dashboard/tasks">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-medium mb-2">Quick Input</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Type your task in natural language, e.g., "Finish project proposal by tomorrow" or "Call John about the meeting tomorrow at 3pm"
        </p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
            placeholder="Type your task here..."
            className="flex-grow rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <Button onClick={handleNaturalLanguageSubmit} variant="outline">
            Parse
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Task Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium">
              Due Date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {!showSuggestions && (
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateSubtaskSuggestions}
                className="w-full"
              >
                Generate Subtask Suggestions
              </Button>
            </div>
          )}

          {showSuggestions && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Suggested Subtasks</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select the subtasks you want to create along with this task.
              </p>
              <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200 p-2 dark:border-gray-700">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="checkbox"
                      id={`suggestion-${index}`}
                      checked={selectedSuggestions.includes(suggestion.title)}
                      onChange={() => toggleSuggestion(suggestion.title)}
                      className="mr-2 h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`suggestion-${index}`} className="flex-grow">
                      <span className="font-medium">{suggestion.title}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({suggestion.priority})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowSuggestions(false)}
                className="w-full"
              >
                Hide Suggestions
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/tasks">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}

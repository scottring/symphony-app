"use client";

import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTasks = async () => {
      if (!currentUser) return;

      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', currentUser.uid),
          where('status', 'in', ['pending', 'in-progress']),
          orderBy('dueDate', 'asc'),
          limit(5)
        );

        const querySnapshot = await getDocs(tasksQuery);
        const tasks: Task[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            id: doc.id,
            title: data.title,
            dueDate: data.dueDate ? data.dueDate.toDate() : null,
            priority: data.priority,
            status: data.status,
          });
        });

        setRecentTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentTasks();
  }, [currentUser]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/dashboard/tasks/new">
          <Button>Add New Task</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
          
          {isLoading ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            </div>
          ) : recentTasks.length > 0 ? (
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </div>
                      <Link href={`/dashboard/tasks/${task.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No upcoming tasks</p>
              <Link href="/dashboard/tasks/new" className="mt-2">
                <Button variant="outline" size="sm">Create your first task</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
            <div className="grid gap-2">
              <Link href="/dashboard/tasks/new">
                <Button variant="outline" className="w-full justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  New Task
                </Button>
              </Link>
              <Link href="/dashboard/goals/new">
                <Button variant="outline" className="w-full justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  New Goal
                </Button>
              </Link>
              <Link href="/dashboard/routines/new">
                <Button variant="outline" className="w-full justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  New Routine
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

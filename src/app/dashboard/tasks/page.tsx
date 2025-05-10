"use client";

import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Timestamp | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
}

export default function TasksPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const fetchTasks = async () => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      let tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        orderBy('dueDate', 'asc')
      );

      if (filter !== 'all') {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', currentUser.uid),
          where('status', '==', filter),
          orderBy('dueDate', 'asc')
        );
      }

      const querySnapshot = await getDocs(tasksQuery);
      const fetchedTasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Task, 'id'>;
        fetchedTasks.push({
          id: doc.id,
          ...data,
        });
      });

      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser, filter]);

  const markTaskAsComplete = async (taskId: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'completed',
        updatedAt: Timestamp.now(),
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'No due date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(timestamp.toDate());
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <Link href="/dashboard/tasks/new">
          <Button>Add New Task</Button>
        </Link>
      </div>

      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="w-24"
        >
          All
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          className="w-24"
        >
          Pending
        </Button>
        <Button
          variant={filter === 'in-progress' ? 'default' : 'outline'}
          onClick={() => setFilter('in-progress')}
          className="w-24"
        >
          In Progress
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          className="w-24"
        >
          Completed
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4"
              >
                <div className="flex-grow space-y-1">
                  <div className="flex items-center">
                    <span className={`mr-2 rounded-full w-3 h-3 ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                      {task.title}
                    </h3>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {task.description.length > 100 
                        ? `${task.description.substring(0, 100)}...` 
                        : task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Due: {formatDate(task.dueDate)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${getPriorityClass(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${getStatusClass(task.status)}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  {task.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markTaskAsComplete(task.id)}
                    >
                      Complete
                    </Button>
                  )}
                  <Link href={`/dashboard/tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-md border border-gray-200 p-6 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No tasks found. Start by creating a new task.
          </p>
          <Link href="/dashboard/tasks/new" className="mt-4">
            <Button>Create New Task</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

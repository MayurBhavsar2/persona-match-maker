// Example of how to use the new JDList components

// 1. Using the JDList Page Component (src/pages/JDList.tsx)
// Add this to your router configuration:

/*
import JDListPage from '@/pages/JDList';

// In your router:
{
  path: "/jd-list",
  element: <JDListPage />
}
*/

// 2. Using the JDList Component (src/components/lists/JDList.tsx)
// Use this when you need the JDList as part of another page:

import React from 'react';
import JDList from '@/components/lists/JDList';

const ExampleUsage = () => {
  const handleEdit = (jdId: string) => {
    console.log('Edit JD:', jdId);
    // Navigate to edit page or open edit modal
  };

  const handleCreate = () => {
    console.log('Create new JD');
    // Navigate to create page or open create modal
  };

  const handleDelete = (jdId: string) => {
    console.log('JD deleted:', jdId);
    // Handle post-delete actions if needed
  };

  return (
    <div className="p-6">
      <JDList
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ExampleUsage;

// Key Features of the new implementation:

// ✅ Uses axiosInstance from utils for API calls
// ✅ Automatic token handling via axios interceptors
// ✅ React Query for data fetching with caching and error handling
// ✅ BasicTable component for consistent table UI
// ✅ Built-in search, sorting, and pagination
// ✅ Loading and error states
// ✅ Refresh functionality
// ✅ Delete confirmation dialog
// ✅ Responsive design
// ✅ TypeScript support

// API Response Handling:
// The component handles various API response formats:
// - { job_descriptions: [...] }
// - { data: [...] }
// - [...]  (direct array)

// Error Handling:
// - Network errors are handled by axiosInstance
// - 401 errors automatically redirect to login
// - Retry logic for network failures
// - User-friendly error messages
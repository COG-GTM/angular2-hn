import React from 'react';

export const FeedComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Feed Component</h2>
      <p className="text-gray-600">This component will display Hacker News feeds (news, newest, show, ask, jobs)</p>
      <p className="text-sm text-gray-500 mt-2">To be implemented in Phase 2</p>
    </div>
  );
};

export const ItemDetailsComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Item Details Component</h2>
      <p className="text-gray-600">This component will display detailed view of stories with comments</p>
      <p className="text-sm text-gray-500 mt-2">To be implemented in Phase 2</p>
    </div>
  );
};

export const UserComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Component</h2>
      <p className="text-gray-600">This component will display user profile information</p>
      <p className="text-sm text-gray-500 mt-2">To be implemented in Phase 2</p>
    </div>
  );
};

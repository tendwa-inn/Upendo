import React from 'react';
import Stories from '../components/discover/Stories';

import DiscoverGrid from '../components/discover/DiscoverGrid';

const DiscoverPage: React.FC = () => {
  return (
    <div className="p-4">
      <Stories />
      <DiscoverGrid />
    </div>
  );
};

export default DiscoverPage;
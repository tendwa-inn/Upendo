import React from 'react';
import Stories from '../components/discover/Stories';

import DiscoverGrid from '../components/discover/DiscoverGrid';

const DiscoverPage: React.FC = () => {
  return (
    <div className="p-4 bg-gradient-to-b from-[#22090E] to-[#2E0C13] min-h-screen text-white">
      {/* <Stories /> */}
      <DiscoverGrid />
    </div>
  );
};

export default DiscoverPage;
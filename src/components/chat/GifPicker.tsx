import React from 'react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';

const giphyFetch = new GiphyFetch('YOUR_GIPHY_API_KEY'); // Replace with your actual API key

interface GifPickerProps {
  onGifClick: (gif: any, e: React.MouseEvent<HTMLElement>) => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onGifClick }) => {
  return (
    <div className="w-full h-64 overflow-y-auto">
      <Grid
        onGifClick={onGifClick}
        fetchGifs={(offset: number) => giphyFetch.trending({ offset, limit: 10 })}
        width={300}
        columns={3}
        gutter={6}
      />
    </div>
  );
};

export default GifPicker;

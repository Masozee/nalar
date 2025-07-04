import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

interface SearchFiltersProps {
  filters: {
    models: string[];
    department?: string;
    topic?: string;
    date_from?: string;
    date_to?: string;
  };
  resultCount: {
    people?: number;
    publications?: number;
    events?: number;
    news?: number;
    media?: number;
    total: number;
  };
  onFilterChange: (filterType: string, value: string | string[]) => void;
  onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  resultCount,
  onFilterChange,
  onClearFilters
}) => {
  const contentTypes = [
    { id: 'people', label: 'People', count: resultCount.people || 0 },
    { id: 'publications', label: 'Publications', count: resultCount.publications || 0 },
    { id: 'events', label: 'Events', count: resultCount.events || 0 },
    { id: 'news', label: 'News', count: resultCount.news || 0 },
    { id: 'media', label: 'Media', count: resultCount.media || 0 }
  ];

  const handleContentTypeChange = (typeId: string) => {
    const currentModels = [...filters.models];
    
    if (currentModels.includes(typeId)) {
      // Remove the type if it's already selected
      const updatedModels = currentModels.filter(type => type !== typeId);
      onFilterChange('models', updatedModels);
    } else {
      // Add the type if it's not selected
      onFilterChange('models', [...currentModels, typeId]);
    }
  };

  const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
    onFilterChange(field, value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FiFilter className="mr-2" /> Filters
        </h3>
        {(filters.models.length > 0 || filters.date_from || filters.date_to) && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:text-primary-dark flex items-center"
          >
            <FiX className="mr-1" /> Clear all
          </button>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-700 mb-3">Content Type</h4>
        <div className="space-y-2">
          {contentTypes.map(type => (
            <div key={type.id} className="flex items-center">
              <input
                id={`filter-${type.id}`}
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={filters.models.includes(type.id)}
                onChange={() => handleContentTypeChange(type.id)}
              />
              <label htmlFor={`filter-${type.id}`} className="ml-2 text-sm text-gray-700 flex-1">
                {type.label}
              </label>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {type.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4">
        <h4 className="font-medium text-gray-700 mb-3">Date Range</h4>
        <div className="space-y-3">
          <div>
            <label htmlFor="date-from" className="block text-sm text-gray-700 mb-1">
              From
            </label>
            <input
              type="date"
              id="date-from"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.date_from || ''}
              onChange={(e) => handleDateChange('date_from', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="date-to" className="block text-sm text-gray-700 mb-1">
              To
            </label>
            <input
              type="date"
              id="date-to"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.date_to || ''}
              onChange={(e) => handleDateChange('date_to', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;

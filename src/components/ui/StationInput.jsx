import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from './Input';
import { cn } from '@/lib/utils';

// Mock stations for autocomplete fallback
const mockStations = [
  { code: 'NDLS', name: 'New Delhi' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus' },
  { code: 'HWH', name: 'Howrah Junction' },
  { code: 'MAS', name: 'Chennai Central' },
  { code: 'SBC', name: 'KSR Bengaluru City' },
  { code: 'BCT', name: 'Mumbai Central' },
  { code: 'MMCT', name: 'Mumbai Central' },
  { code: 'PNBE', name: 'Patna Junction' },
  { code: 'LKO', name: 'Lucknow NR' },
  { code: 'ADI', name: 'Ahmedabad Junction' },
  { code: 'PUNE', name: 'Pune Junction' },
  { code: 'JP', name: 'Jaipur Junction' },
  { code: 'CNB', name: 'Kanpur Central' },
  { code: 'BBS', name: 'Bhubaneswar' },
  { code: 'SC', name: 'Secunderabad Junction' },
  { code: 'GHY', name: 'Guwahati' },
];

export function StationInput({
  label,
  value,
  onChange,
  placeholder = 'Enter Station',
  error,
  className
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Initialize search term if value is provided and matches a station code
  useEffect(() => {
    if (value) {
      const station = mockStations.find((s) => s.code === value);
      if (station && !isOpen) {
        setSearchTerm(`${station.name} (${station.code})`);
      } else if (!station && !isOpen) {
        setSearchTerm(value);
      }
    } else if (!value && !isOpen) {
      setSearchTerm('');
    }
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search term to selected value if clicking outside
        const station = mockStations.find((s) => s.code === value);
        if (station) {
          setSearchTerm(`${station.name} (${station.code})`);
        } else if (value) {
          setSearchTerm(value);
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredStations = mockStations
    .filter(
      (station) =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 5);

  const handleSelect = (station) => {
    onChange(station.code);
    setSearchTerm(`${station.name} (${station.code})`);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (e.target.value === '') {
      onChange('');
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <Input
        label={label}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        error={error}
        leftIcon={<MapPin size={16} />}
        autoComplete="off"
      />

      {isOpen && searchTerm.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredStations.length > 0 ? (
            <ul className="py-1">
              {filteredStations.map((station) => (
                <li
                  key={station.code}
                  className="px-4 py-2 hover:bg-muted cursor-pointer flex justify-between items-center transition-colors"
                  onClick={() => handleSelect(station)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{station.name}</span>
                    <span className="text-xs text-muted-foreground">{station.city || station.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {station.code}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground flex items-center justify-center">
              <Search className="mr-2 h-4 w-4" />
              No stations found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

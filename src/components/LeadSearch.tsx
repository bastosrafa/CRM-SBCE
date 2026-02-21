import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Lead } from '../utils/types';

interface LeadSearchProps {
  leads: Lead[];
  onSearch: (searchTerm: string) => void;
  onSelectLead: (lead: Lead) => void;
  placeholder?: string;
}

const LeadSearch: React.FC<LeadSearchProps> = ({
  leads,
  onSearch,
  onSelectLead,
  placeholder = "Pesquisar leads por nome..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Filtrar leads baseado no termo de busca
  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.company?.toLowerCase().includes(term) ||
      lead.course?.toLowerCase().includes(term)
    ).slice(0, 10); // Limitar a 10 sugestões
  }, [leads, searchTerm]);

  // Atualizar busca quando o termo muda
  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredLeads.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredLeads.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLeads.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredLeads.length) {
          handleSelectLead(filteredLeads[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSearchTerm(lead.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelectLead(lead);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch('');
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(searchTerm.length > 0)}
          onBlur={() => {
            // Delay para permitir cliques nas sugestões
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sugestões */}
      {showSuggestions && filteredLeads.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredLeads.map((lead, index) => (
            <div
              key={lead.id}
              onClick={() => handleSelectLead(lead)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-300">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {highlightMatch(lead.name, searchTerm)}
                  </div>
                  {lead.email && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {highlightMatch(lead.email, searchTerm)}
                    </div>
                  )}
                  {lead.company && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {highlightMatch(lead.company, searchTerm)}
                    </div>
                  )}
                  {lead.course && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {highlightMatch(lead.course, searchTerm)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contador de resultados */}
      {searchTerm && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 dark:text-gray-400">
          {filteredLeads.length > 0 
            ? `${filteredLeads.length} resultado${filteredLeads.length !== 1 ? 's' : ''} encontrado${filteredLeads.length !== 1 ? 's' : ''}`
            : 'Nenhum resultado encontrado'
          }
        </div>
      )}
    </div>
  );
};

export default LeadSearch;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  CalendarIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { knowledgeService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const contentTypes = [
  { id: 'all', label: 'All', icon: DocumentTextIcon },
  { id: 'meeting', label: 'Meetings', icon: VideoCameraIcon },
  { id: 'document', label: 'Documents', icon: DocumentTextIcon },
  { id: 'email', label: 'Emails', icon: EnvelopeIcon },
];

const recentSearches = [
  'product roadmap',
  'authentication system',
  'team communication',
  'project planning',
  'user feedback'
];

const suggestions = [
  'Find all decisions from last month',
  'Show me action items assigned to Sarah',
  'What did we discuss about mobile development?',
  'Search for budget-related conversations'
];

export default function Knowledge() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [pinnedResults, setPinnedResults] = useState<string[]>([]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await knowledgeService.search(searchQuery);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const togglePin = (resultId: string) => {
    setPinnedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-neon/30 text-neon px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const filteredResults = results.filter(result => 
    activeFilter === 'all' || result.type === activeFilter
  );

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Knowledge Base
            <span className="block text-lg font-normal text-muted mt-2">
              Semantic search across all your meetings and documents
            </span>
          </h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-3xl p-2 mb-8 max-w-4xl mx-auto"
        >
          <div className="flex items-center">
            <MagnifyingGlassIcon className="w-6 h-6 text-muted ml-6 mr-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-lg placeholder-muted focus:outline-none py-4"
              placeholder="Search for meetings, decisions, action items..."
            />
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim() || isLoading}
              className="bg-primary-gradient text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all disabled:opacity-50 neon-glow"
            >
              {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : 'Search'}
            </button>
          </div>
        </motion.div>

        {/* Suggestions (shown when no search has been made) */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recent Searches */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2 text-neon" />
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="block w-full text-left glass rounded-xl p-3 hover:bg-white/5 transition-all text-sm"
                    >
                      "{search}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Suggestions */}
              <div>
                <h3 className="font-semibold mb-4">Try These Queries</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="block w-full text-left glass rounded-xl p-3 hover:bg-white/5 transition-all text-sm text-muted hover:text-text"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters (shown when there are results) */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="flex space-x-2 glass rounded-2xl p-2">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveFilter(type.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      activeFilter === type.id
                        ? 'bg-neon/20 text-neon'
                        : 'text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" color="text-neon" />
              <p className="text-muted mt-4">Searching knowledge base...</p>
            </div>
          </div>
        ) : filteredResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted">
                Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "<span className="text-neon">{query}</span>"
              </p>
              {query.toLowerCase() !== query && (
                <div className="text-sm text-muted">
                  Did you mean "<button 
                    onClick={() => handleSearch(query.toLowerCase())}
                    className="text-neon hover:text-neon/80 underline"
                  >
                    {query.toLowerCase()}
                  </button>"?
                </div>
              )}
            </div>

            {filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold group-hover:text-neon transition-colors">
                        {highlightQuery(result.title, query)}
                      </h3>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.type === 'meeting' ? 'bg-blue-500/20 text-blue-400' :
                        result.type === 'document' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {result.type}
                      </span>
                      
                      <div className="flex items-center space-x-1 text-sm text-muted">
                        <SparklesIcon className="w-4 h-4" />
                        <span>{Math.round(result.relevance * 100)}% match</span>
                      </div>
                    </div>
                    
                    <p className="text-muted mb-4 leading-relaxed">
                      {highlightQuery(result.snippet, query)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">{result.date}</span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(result.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            pinnedResults.includes(result.id)
                              ? 'text-yellow-400 bg-yellow-500/20'
                              : 'text-muted hover:text-yellow-400 hover:bg-yellow-500/10'
                          }`}
                        >
                          <StarIcon className="w-4 h-4" />
                        </button>
                        
                        <button className="text-neon hover:text-neon/80 text-sm font-medium">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : hasSearched && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-gradient/20 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-primary-from" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted mb-6">
              Try adjusting your search terms or browse recent searches above
            </p>
            <button
              onClick={() => {setQuery(''); setHasSearched(false); setResults([]);}}
              className="bg-primary-gradient text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all neon-glow"
            >
              Clear Search
            </button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
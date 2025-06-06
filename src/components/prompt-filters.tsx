"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface PromptFiltersProps {
  onFiltersChange?: (filters: {
    search: string;
    type: string;
    sort: string;
    category: string;
  }) => void;
  initialFilters?: {
    search?: string;
    type?: string;
    sort?: string;
    category?: string;
  };
}

export function PromptFilters({ onFiltersChange, initialFilters }: PromptFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    search: initialFilters?.search || searchParams.get('search') || '',
    type: initialFilters?.type || searchParams.get('type') || 'all',
    sort: initialFilters?.sort || searchParams.get('sort') || 'recent',
    category: initialFilters?.category || searchParams.get('category') || 'all',
  });

  // Debounced search to avoid too many API calls
  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateFilter('search', value);
  }, 300);

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
    
    // Call parent callback if provided
    onFiltersChange?.(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    debouncedSearch(value);
  };

  // Update filters when URL params change
  useEffect(() => {
    const newFilters = {
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || 'all',
      sort: searchParams.get('sort') || 'recent',
      category: searchParams.get('category') || 'all',
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [searchParams, onFiltersChange]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search prompts..."
          className="pl-10 h-12 text-base"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
      {/* Filter Tabs and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Prompt Type Tabs */}
        <Tabs value={filters.type} onValueChange={(value) => updateFilter('type', value)} className="w-full lg:w-auto">
          <TabsList className="grid w-full lg:w-auto grid-cols-4 lg:grid-cols-4">
            <TabsTrigger value="all" className="cursor-pointer">All Prompts</TabsTrigger>
            <TabsTrigger value="system" className="cursor-pointer">System</TabsTrigger>
            <TabsTrigger value="user" className="cursor-pointer">User</TabsTrigger>
            <TabsTrigger value="developer" className="cursor-pointer">Developer</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Sort and Filter Controls */}
        <div className="flex gap-3 w-full lg:w-auto">
          <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value)}>
            <SelectTrigger className="w-full lg:w-[180px] cursor-pointer">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="upvotes">Most Upvoted</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="copies">Most Copied</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger className="w-full lg:w-[180px] cursor-pointer">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="writing">Writing</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
} 
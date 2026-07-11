import { useState } from 'react';
import { Search, SortAsc, Trash2, MoreVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

export type SortOption = 'newest' | 'oldest' | 'title' | 'color';
export type FilterOption = 'all' | 'pinned' | 'folder' | 'color';

interface NotesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedCount: number;
  onMassDelete: () => void;
  folders: Array<{ id: number; name: string }>;
  onFilterChange?: (filter: FilterOption, value?: string) => void;
}

export function NotesToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCount,
  onMassDelete,
  folders,
}: NotesToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SortAsc className="w-4 h-4 mr-2" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortChange('newest')} className="gap-2">
              <Check className={cn("w-3.5 h-3.5", sortBy !== 'newest' && "opacity-0")} />Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('oldest')} className="gap-2">
              <Check className={cn("w-3.5 h-3.5", sortBy !== 'oldest' && "opacity-0")} />Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('title')} className="gap-2">
              <Check className={cn("w-3.5 h-3.5", sortBy !== 'title' && "opacity-0")} />Title (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('color')} className="gap-2">
              <Check className={cn("w-3.5 h-3.5", sortBy !== 'color' && "opacity-0")} />By Color
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Quick Filters</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>By Folder</DropdownMenuItem>
            <DropdownMenuItem>By Color</DropdownMenuItem>
            <DropdownMenuItem>Pinned Only</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mass Delete Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <span className="text-sm font-medium">
            {selectedCount} note{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={onMassDelete}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </Button>
        </div>
      )}
    </div>
  );
}

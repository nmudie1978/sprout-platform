'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Video,
  Headphones,
  Film,
  ExternalLink,
  Trash2,
  Tag,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import type { SavedItemData, SavedItemType } from '@/lib/journey/types';

// Icon mapping for item types
const typeIcons: Record<SavedItemType, React.ComponentType<{ className?: string }>> = {
  ARTICLE: BookOpen,
  VIDEO: Video,
  PODCAST: Headphones,
  SHORT: Film,
};

// Color mapping for item types
const typeColors: Record<SavedItemType, string> = {
  ARTICLE: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  VIDEO: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  PODCAST: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  SHORT: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
};

const typeLabels: Record<SavedItemType, string> = {
  ARTICLE: 'Articles',
  VIDEO: 'Videos',
  PODCAST: 'Podcasts',
  SHORT: 'Shorts',
};

export function LibraryTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<SavedItemType | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    items: SavedItemData[];
    total: number;
    counts: { articles: number; videos: number; podcasts: number; shorts: number; total: number };
  }>({
    queryKey: ['journey-library', filter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (filter !== 'all') {
        params.set('type', filter);
      }
      if (search) {
        params.set('search', search);
      }
      const response = await fetch(`/api/journey/saved-items?${params}`);
      if (!response.ok) throw new Error('Failed to fetch library');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/journey/saved-items?id=${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-library'] });
    },
  });

  const items = data?.items || [];
  const counts = data?.counts;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to load library</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Library
          </h2>
          {counts && (
            <p className="text-sm text-muted-foreground mt-1">
              {counts.total} items saved
            </p>
          )}
        </div>
      </div>

      {/* Type Filter Badges */}
      {counts && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({counts.total})
          </Button>
          {(['ARTICLE', 'VIDEO', 'PODCAST', 'SHORT'] as SavedItemType[]).map((type) => {
            const Icon = typeIcons[type];
            const count = counts[type.toLowerCase() as keyof typeof counts] as number;
            if (count === 0) return null;
            return (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
                className="gap-1"
              >
                <Icon className="h-3 w-3" />
                {typeLabels[type]} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your library..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your library is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Save articles, videos, and podcasts as you explore careers
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {items.map((item, index) => {
              const Icon = typeIcons[item.type];
              const colorClass = typeColors[item.type];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow group">
                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                          {item.source && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.source}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                          {item.description}
                        </p>
                      )}

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          asChild
                        >
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

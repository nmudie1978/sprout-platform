"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Archive,
  Plus,
  Briefcase,
  MessageSquare,
  Award,
  Image,
  FileText,
  Star,
  Lock,
} from "lucide-react";
import { getVaultItems, createVaultItem } from "@/lib/my-path/actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  job: { icon: Briefcase, label: "Job", color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  feedback: { icon: MessageSquare, label: "Feedback", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  certificate: { icon: Award, label: "Certificate", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
  photo: { icon: Image, label: "Photo", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30" },
  note: { icon: FileText, label: "Note", color: "text-slate-600 bg-slate-100 dark:bg-slate-900/30" },
  milestone: { icon: Star, label: "Milestone", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
};

export default function VaultPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["vault-items"],
    queryFn: () => getVaultItems(),
    staleTime: 60 * 1000,
  });

  const filteredItems = selectedType
    ? items?.filter((item) => item.type === selectedType)
    : items;

  const types = items
    ? [...new Set(items.map((item) => item.type))]
    : [];

  if (isLoading) {
    return <VaultSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">The Vault</h2>
          <p className="text-sm text-muted-foreground">
            Your private collection of proof and achievements
          </p>
        </div>
        <AddVaultItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => {
            setDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["vault-items"] });
          }}
        />
      </div>

      {/* Privacy Note */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          Everything in your Vault is private. You control what to share.
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      {types.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedType(null)}
          >
            All ({items?.length || 0})
          </Button>
          {Object.entries(typeConfig).map(([key, config]) => {
            const count = items?.filter((i) => i.type === key).length || 0;
            if (count === 0 && !types.includes(key)) return null;
            const Icon = config.icon;
            return (
              <Button
                key={key}
                variant={selectedType === key ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedType(key)}
              >
                <Icon className="h-4 w-4 mr-1" />
                {config.label} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Items Grid */}
      {filteredItems && filteredItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const config = typeConfig[item.type] || typeConfig.note;
            const Icon = config.icon;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}

                  {/* Job Link */}
                  {item.job && (
                    <Badge variant="secondary" className="text-xs">
                      From: {item.job.title}
                    </Badge>
                  )}

                  {/* Type Badge */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.type}
                    </Badge>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">Your Vault is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start collecting proof of your skills and achievements
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add first item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AddVaultItemDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createVaultItem({
        type,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast.success("Added to Vault");
        setTitle("");
        setDescription("");
        setType("note");
        onSuccess();
      } else {
        toast.error(result.error || "Failed to add item");
      }
    } catch {
      toast.error("Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add to Vault
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Vault</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., First 5-star review"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add to Vault"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VaultSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

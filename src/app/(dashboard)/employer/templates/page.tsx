"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  FileText,
  Pencil,
  Trash2,
  Copy,
  Loader2,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface JobTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: string | null;
  payAmount: number | null;
  payType: string;
  requirements: string[];
  createdAt: string;
}

const categoryOptions = [
  { value: "BABYSITTING", label: "Babysitting", emoji: "👶" },
  { value: "DOG_WALKING", label: "Dog Walking", emoji: "🐕" },
  { value: "SNOW_CLEARING", label: "Snow Clearing", emoji: "❄️" },
  { value: "CLEANING", label: "Cleaning", emoji: "🧹" },
  { value: "DIY_HELP", label: "DIY Help", emoji: "🔧" },
  { value: "TECH_HELP", label: "Tech Help", emoji: "💻" },
  { value: "ERRANDS", label: "Errands", emoji: "🏃" },
  { value: "OTHER", label: "Other", emoji: "✨" },
];

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

export default function TemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    category: "",
    location: "",
    duration: "",
    payAmount: "",
    payType: "FIXED",
  });

  const { data: templates, isLoading } = useQuery<JobTemplate[]>({
    queryKey: ["job-templates"],
    queryFn: async () => {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-templates"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Template created");
    },
    onError: () => {
      toast.error("Failed to create template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: typeof formData;
    }) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-templates"] });
      setEditingTemplate(null);
      resetForm();
      toast.success("Template updated");
    },
    onError: () => {
      toast.error("Failed to update template");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-templates"] });
      toast.success("Template deleted");
    },
    onError: () => {
      toast.error("Failed to delete template");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      description: "",
      category: "",
      location: "",
      duration: "",
      payAmount: "",
      payType: "FIXED",
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.title || !formData.category) {
      toast.error("Please fill in name, title, and category");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingTemplate) return;
    updateMutation.mutate({ id: editingTemplate.id, data: formData });
  };

  const handleEdit = (template: JobTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      description: template.description,
      category: template.category,
      location: template.location,
      duration: template.duration || "",
      payAmount: template.payAmount?.toString() || "",
      payType: template.payType,
    });
  };

  const handleUseTemplate = (template: JobTemplate) => {
    // Store template data and navigate to post job page
    sessionStorage.setItem("jobTemplate", JSON.stringify(template));
    router.push("/employer/post-job?template=true");
  };

  const TemplateForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Weekly Dog Walk"
        />
      </div>

      <div className="space-y-2">
        <Label>Job Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Dog Walking - 1 hour"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Job description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="e.g., Downtown"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Duration</Label>
          <Input
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            placeholder="e.g., 2 hours"
          />
        </div>

        <div className="space-y-2">
          <Label>Pay Amount</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.payAmount}
            onChange={(e) =>
              setFormData({ ...formData, payAmount: e.target.value })
            }
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label>Pay Type</Label>
          <Select
            value={formData.payType}
            onValueChange={(value) =>
              setFormData({ ...formData, payType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED">Fixed</SelectItem>
              <SelectItem value="HOURLY">Hourly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={isEdit ? handleUpdate : handleCreate}
        disabled={createMutation.isPending || updateMutation.isPending}
        className="w-full"
      >
        {createMutation.isPending || updateMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        {isEdit ? "Update Template" : "Create Template"}
      </Button>
    </div>
  );

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/employer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Job Templates</h1>
            <p className="text-muted-foreground">
              Save time with reusable job templates
            </p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Job Template</DialogTitle>
            </DialogHeader>
            <TemplateForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      ) : !templates || templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-semibold text-lg mb-2">No templates yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create templates for jobs you post frequently
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {categoryEmojis[template.category] || "✨"}
                      </span>
                      <div>
                        <CardTitle className="text-base">
                          {template.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {template.title}
                        </p>
                      </div>
                    </div>
                    {template.payAmount && (
                      <Badge variant="secondary">
                        <DollarSign className="h-3 w-3 mr-0.5" />
                        {formatCurrency(template.payAmount)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {template.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Use
                    </Button>
                    <Dialog
                      open={editingTemplate?.id === template.id}
                      onOpenChange={(open) => {
                        if (!open) setEditingTemplate(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Template</DialogTitle>
                        </DialogHeader>
                        <TemplateForm isEdit />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(template.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

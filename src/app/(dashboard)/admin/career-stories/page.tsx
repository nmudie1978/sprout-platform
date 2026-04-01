'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Video, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CareerStory {
  id: string;
  videoUrl: string;
  videoId: string;
  duration: string | null;
  name: string;
  jobTitle: string;
  company: string | null;
  location: string | null;
  yearsInRole: number | null;
  careerTags: string[];
  industry: string | null;
  headline: string;
  takeaways: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export default function AdminCareerStories() {
  const { data: session } = useSession();
  const [stories, setStories] = useState<CareerStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [videoUrl, setVideoUrl] = useState('');
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [yearsInRole, setYearsInRole] = useState('');
  const [careerTags, setCareerTags] = useState('');
  const [industry, setIndustry] = useState('');
  const [headline, setHeadline] = useState('');
  const [takeaways, setTakeaways] = useState('');
  const [duration, setDuration] = useState('');

  // Load stories
  useEffect(() => {
    fetch('/api/career-stories')
      .then(r => r.json())
      .then(d => { setStories(d.stories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const res = await fetch('/api/career-stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl,
        name,
        jobTitle,
        company: company || undefined,
        location: location || undefined,
        yearsInRole: yearsInRole || undefined,
        careerTags: careerTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        industry: industry || undefined,
        headline,
        takeaways: takeaways.split('\n').map(t => t.trim()).filter(Boolean),
        duration: duration || undefined,
      }),
    });

    if (res.ok) {
      const { story } = await res.json();
      setStories(prev => [story, ...prev]);
      setSaved(true);
      // Reset form
      setVideoUrl(''); setName(''); setJobTitle(''); setCompany('');
      setLocation(''); setYearsInRole(''); setCareerTags('');
      setIndustry(''); setHeadline(''); setTakeaways(''); setDuration('');
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this story?')) return;
    await fetch(`/api/career-stories/${id}`, { method: 'DELETE' });
    setStories(prev => prev.filter(s => s.id !== id));
  };

  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-8 text-center text-muted-foreground">Admin access required</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">Career Stories</h1>
      <p className="text-sm text-muted-foreground mb-6">Upload short video stories from professionals — these appear in the Grow section of My Journey.</p>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-4 mb-8">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add new story</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">YouTube URL *</label>
            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
            <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 3:45" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nicky M." required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Job title *</label>
            <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Programme Manager" required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Company</label>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Telenor" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Location</label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Oslo" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Years in role</label>
            <Input value={yearsInRole} onChange={e => setYearsInRole(e.target.value)} placeholder="e.g. 15" type="number" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Industry</label>
            <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Telecommunications" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Career tags * (comma-separated)</label>
          <Input value={careerTags} onChange={e => setCareerTags(e.target.value)} placeholder="e.g. it-project-manager, programme-manager, project-manager" required />
          <p className="text-[10px] text-muted-foreground/40 mt-1">Use career IDs from the career pathways data. Separate multiple tags with commas.</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Headline *</label>
          <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. From junior dev to running a €50M programme" required />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Key takeaways (one per line)</label>
          <Textarea value={takeaways} onChange={e => setTakeaways(e.target.value)} placeholder={"Started as a developer at age 22\nMoved into management after 8 years\nNow leading cross-border programmes"} rows={3} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saved ? <><Check className="h-4 w-4 mr-1" /> Saved</> : saving ? 'Saving...' : <><Plus className="h-4 w-4 mr-1" /> Publish story</>}
          </Button>
        </div>
      </form>

      {/* Existing stories */}
      <h2 className="text-sm font-semibold mb-3">Published stories ({stories.length})</h2>
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : stories.length === 0 ? (
        <p className="text-xs text-muted-foreground">No stories yet. Add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {stories.map(story => (
            <div key={story.id} className="rounded-lg border border-border/30 bg-card/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-muted/20 flex items-center justify-center shrink-0">
                    <Video className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground/85">{story.headline}</p>
                    <p className="text-xs text-muted-foreground/50">{story.name} — {story.jobTitle}{story.company ? ` at ${story.company}` : ''}{story.location ? `, ${story.location}` : ''}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {story.careerTags.map(tag => (
                        <span key={tag} className="inline-flex rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-medium text-violet-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={story.videoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-muted-foreground/30 hover:text-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button onClick={() => handleDelete(story.id)} className="p-1.5 rounded text-muted-foreground/30 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

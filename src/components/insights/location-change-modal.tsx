"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";

interface LocationChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocation: {
    city?: string | null;
    region?: string | null;
    country?: string | null;
  };
  onSave: (location: {
    city: string;
    region: string;
    country: string;
  }) => Promise<void>;
}

export function LocationChangeModal({
  open,
  onOpenChange,
  currentLocation,
  onSave,
}: LocationChangeModalProps) {
  const [city, setCity] = useState(currentLocation.city || "");
  const [region, setRegion] = useState(currentLocation.region || "");
  const [country, setCountry] = useState(currentLocation.country || "Norway");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!city.trim()) {
      setError("Please enter your city");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSave({
        city: city.trim(),
        region: region.trim(),
        country: country.trim() || "Norway",
      });
      onOpenChange(false);
    } catch (err) {
      setError("Failed to save location. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Update Your Location
          </DialogTitle>
          <DialogDescription>
            Set your location to see career events near you. We use this to show
            events within 50km of your area.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Oslo, Bergen, Trondheim"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="region">Region / County</Label>
            <Input
              id="region"
              placeholder="e.g., Viken, Oslo, Vestland"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Norway"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Location"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSheet, MobileSheetFooter } from "@/components/mobile/MobileSheet";
import { cn } from "@/lib/utils";

interface IntentVariable {
  name: string;
  label: string;
  type: string;
  required: boolean;
  maxLength?: number;
  placeholder?: string;
}

interface MessageIntentData {
  intent: string;
  label: string;
  description: string;
  template: string;
  hasVariables: boolean;
  variables: IntentVariable[];
}

interface MessageIntentSheetProps {
  open: boolean;
  onClose: () => void;
  intents: MessageIntentData[];
  onSend: (data: { intent: string; variables: Record<string, string> }) => void;
  isPending?: boolean;
}

/**
 * MessageIntentSheet - Mobile-friendly message intent picker
 *
 * Replaces the dropdown selector on mobile with a full bottom sheet.
 * Shows list of intents, then input fields when one is selected.
 * Task-focused, no emojis or avatars.
 */
export function MessageIntentSheet({
  open,
  onClose,
  intents,
  onSend,
  isPending = false,
}: MessageIntentSheetProps) {
  const [selectedIntent, setSelectedIntent] = useState<MessageIntentData | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [view, setView] = useState<"list" | "compose">("list");

  // Reset when sheet opens
  useEffect(() => {
    if (open) {
      setSelectedIntent(null);
      setVariables({});
      setView("list");
    }
  }, [open]);

  // Handle intent selection
  const handleSelectIntent = (intent: MessageIntentData) => {
    setSelectedIntent(intent);
    setVariables({});
    setView("compose");
  };

  // Handle back to list
  const handleBack = () => {
    setView("list");
    setSelectedIntent(null);
    setVariables({});
  };

  // Handle variable change
  const handleVariableChange = (name: string, value: string, maxLength?: number) => {
    if (maxLength && value.length > maxLength) return;
    setVariables((prev) => ({ ...prev, [name]: value }));
  };

  // Check if ready to send
  const isReadyToSend = () => {
    if (!selectedIntent) return false;
    for (const variable of selectedIntent.variables) {
      if (variable.required && (!variables[variable.name] || variables[variable.name].trim() === "")) {
        return false;
      }
    }
    return true;
  };

  // Get message preview
  const getMessagePreview = () => {
    if (!selectedIntent) return "";
    let preview = selectedIntent.template;
    for (const variable of selectedIntent.variables) {
      const value = variables[variable.name] || `[${variable.name}]`;
      preview = preview.replace(`[${variable.name}]`, value);
    }
    return preview;
  };

  // Handle send
  const handleSend = () => {
    if (!selectedIntent || !isReadyToSend()) return;
    onSend({
      intent: selectedIntent.intent,
      variables,
    });
  };

  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title={view === "list" ? "Choose message type" : selectedIntent?.label || "Compose message"}
      description={view === "list" ? "Select the type of message you want to send" : selectedIntent?.description}
    >
      <AnimatePresence mode="wait">
        {/* Intent List View */}
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1"
          >
            {intents.map((intent) => (
              <button
                key={intent.intent}
                onClick={() => handleSelectIntent(intent)}
                className="w-full p-3 rounded-lg border hover:bg-muted/50 hover:border-primary/30 transition-colors text-left flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-muted">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{intent.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{intent.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Compose View */}
        {view === "compose" && selectedIntent && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Message Preview */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Preview</p>
              <p className="text-sm">{getMessagePreview()}</p>
            </div>

            {/* Variable Inputs */}
            {selectedIntent.variables.length > 0 && (
              <div className="space-y-3">
                {selectedIntent.variables.map((variable) => (
                  <div key={variable.name} className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1">
                      {variable.label}
                      {variable.required && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      value={variables[variable.name] || ""}
                      onChange={(e) => handleVariableChange(variable.name, e.target.value, variable.maxLength)}
                      placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}`}
                      maxLength={variable.maxLength}
                      className="h-11"
                    />
                    {variable.maxLength && (
                      <p className="text-xs text-muted-foreground text-right">
                        {(variables[variable.name] || "").length}/{variable.maxLength}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No variables - show fixed message */}
            {selectedIntent.variables.length === 0 && (
              <div className="p-3 rounded-lg border bg-primary/5">
                <p className="text-sm">{selectedIntent.template}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  This is a fixed message that will be sent as-is.
                </p>
              </div>
            )}

            {/* Actions */}
            <MobileSheetFooter>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
                className="flex-1 h-11"
              >
                Back
              </Button>
              <Button
                onClick={handleSend}
                disabled={!isReadyToSend() || isPending}
                className="flex-1 h-11"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </MobileSheetFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileSheet>
  );
}

import { motion } from "framer-motion";
import { Folder, FileText, Image, Download, MoreVertical, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NotePreviewCardProps {
  id: number;
  title: string;
  preview: string;
  folder?: string;
  format?: string;
  color?: string;
  isPinned?: boolean;
  createdAt?: string;
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: () => void;
}

export function NotePreviewCard({
  id,
  title,
  preview,
  folder,
  format = "markdown",
  color = "#f59e0b",
  isPinned = false,
  createdAt,
  onPin,
  onDelete,
  onDownload,
  onClick,
}: NotePreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Generate gradient based on color
  const getGradient = (baseColor: string) => {
    return `linear-gradient(135deg, ${baseColor}20 0%, ${baseColor}05 100%)`;
  };

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Get preview text (strip markdown)
  const getPreviewText = (text: string) => {
    return text
      .replace(/^#+\s/gm, "") // Remove headers
      .replace(/\*\*/g, "") // Remove bold
      .replace(/\*/g, "") // Remove italics
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links
      .slice(0, 120)
      .trim();
  };

  const previewText = getPreviewText(preview);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-64 cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      {/* Background with gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: getGradient(color),
        }}
      />

      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${color}15 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${color}10 0%, transparent 50%)`,
        }}
        animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col p-4 z-10">
        {/* Header with pin and menu */}
        <div className="flex items-start justify-between mb-3">
          <motion.div
            className="flex-1 pr-2"
            initial={{ opacity: 0.8 }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0.8 }}
          >
            <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
              {title}
            </h3>
          </motion.div>

          {/* Pin and menu buttons */}
          <motion.div
            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: 10 }}
            animate={isHovered ? { x: 0 } : { x: 10 }}
          >
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onPin?.(id);
              }}
            >
              <Pin
                className={cn(
                  "w-3.5 h-3.5",
                  isPinned ? "fill-current" : ""
                )}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.(id);
                  }}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(id);
                  }}
                  className="gap-2 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>

        {/* Preview text */}
        <motion.div
          className="flex-1 mb-3 overflow-hidden"
          animate={isHovered ? { opacity: 0.9 } : { opacity: 0.7 }}
        >
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {previewText || "No preview available"}
          </p>
        </motion.div>

        {/* Footer with metadata */}
        <motion.div
          className="flex items-center justify-between pt-2 border-t border-border/20"
          animate={isHovered ? { opacity: 1 } : { opacity: 0.6 }}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {folder && (
              <div className="flex items-center gap-1">
                <Folder className="w-3 h-3" />
                <span className="truncate">{folder}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {format && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {format}
              </span>
            )}
            {createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatDate(createdAt)}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Hover shine effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
        }}
        animate={isHovered ? { x: ["-100%", "100%"] } : { x: "-100%" }}
        transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
      />
    </motion.div>
  );
}

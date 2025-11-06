import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, Calendar, MapPin, Clock } from "lucide-react";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Event {
  id: number;
  name: string;
  address_name: string;
  time: string;
}

const initialEvents: Event[] = [
  {
    id: 1,
    name: "Summer Music Festival 2024",
    address_name: "Central Park, New York",
    time: "2024-07-15 18:00",
  },
  {
    id: 2,
    name: "Tech Innovation Summit",
    address_name: "Convention Center, San Francisco",
    time: "2024-08-22 09:00",
  },
  {
    id: 3,
    name: "Art & Culture Exhibition",
    address_name: "Metropolitan Museum, NYC",
    time: "2024-06-10 14:00",
  },
];

const searchableEvents: Event[] = [
  {
    id: 4,
    name: "Jazz Night Under the Stars",
    address_name: "Riverside Amphitheater",
    time: "2024-07-20 20:00",
  },
  {
    id: 5,
    name: "Food & Wine Festival",
    address_name: "Downtown Plaza",
    time: "2024-09-05 12:00",
  },
  {
    id: 6,
    name: "Marathon 2024",
    address_name: "City Streets",
    time: "2024-10-12 06:00",
  },
  {
    id: 7,
    name: "Photography Workshop",
    address_name: "Studio Gallery",
    time: "2024-06-25 10:00",
  },
  {
    id: 8,
    name: "Classical Concert Series",
    address_name: "Symphony Hall",
    time: "2024-08-08 19:30",
  },
];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>(initialEvents);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((query: string) => {
      if (query.trim() === "") {
        setDisplayedEvents(initialEvents);
      } else {
        const filtered = searchableEvents.filter(
          (event) =>
            event.name.toLowerCase().includes(query.toLowerCase()) ||
            event.address_name.toLowerCase().includes(query.toLowerCase())
        );
        setDisplayedEvents(filtered);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
      // Reset search when opening
      setSearchQuery("");
      setDisplayedEvents(initialEvents);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Container */}
      <div className="relative w-full max-w-2xl mx-4 mt-20 md:mt-32 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input Section */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={t("dashboard.search.placeholder") || "Search events..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base bg-background border-input focus-visible:ring-2 focus-visible:ring-primary"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="max-h-[60vh] overflow-y-auto">
            {displayedEvents.length > 0 ? (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {searchQuery ? "Search Results" : "Popular Events"}
                </div>
                <div className="space-y-1">
                  {displayedEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        // Navigate to event - will be implemented later
                        console.log("Navigate to event:", event.id);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-3 rounded-md hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {event.name}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.address_name}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(event.time).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No events found for "{searchQuery}"
                </p>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-border bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Press ESC to close</span>
              <span>Enter to select</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

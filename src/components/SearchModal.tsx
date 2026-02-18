import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, X, Calendar, MapPin, Clock } from "lucide-react";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventGateway } from "@/lib/EventGateway";
import { useGetEvents } from "@/api/event/api";
import generateSlug from "@/helpers/generateSlug";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvents?: Event[];
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

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, initialEvents: propInitialEvents }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const eventGateway = new EventGateway(import.meta.env.VITE_API_BASE_URL);

  const handleEventClick = (event: Event) => {
    const slug = generateSlug(event.name, event.id);
    navigate(`/event/${slug}`);
    onClose();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(i18n.language === "pt" ? "pt-BR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "pt" ? "pt-BR" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Use prop events or fallback to default
  const eventsToShow = propInitialEvents || initialEvents;
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>(eventsToShow);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 300)
  ).current;

  // API search query
  const { data: searchResults } = useGetEvents({
    page: 1,
    limit: 10,
    search: debouncedSearchQuery || undefined,
    active: "true",
    only_ongoing: true,
  });

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Update displayed events based on search results
  useEffect(() => {
    if (debouncedSearchQuery.trim() === "") {
      setDisplayedEvents(eventsToShow);
    } else if (searchResults?.events) {
      // Transform API results to match Event interface
      const transformedEvents = searchResults.events.map(event => ({
        id: event.id,
        name: event.name,
        address_name: event.address_name,
        time: event.start_date,
      }));
      setDisplayedEvents(transformedEvents);
    }
  }, [debouncedSearchQuery, searchResults, eventsToShow]);

  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
      // Reset search when opening
      setSearchQuery("");
      setDisplayedEvents(eventsToShow);
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
                      onClick={() => handleEventClick(event)}
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
                              {formatDate(event.time)} • {formatTime(event.time)}
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

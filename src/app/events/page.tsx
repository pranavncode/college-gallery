
'use client';

import React, { useEffect, useState } from 'react'; 
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useSearchParams and useRouter
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { placeholderEvents, CampusEvent } from "@/lib/constants"; 
import { CalendarDays, MapPin, Ticket, PlusCircle, Edit, Trash2, Clock, CalendarIcon as CalendarIconLucide, Info } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";


const ADMIN_EMAIL = "admin@gehu.ac.in";
const SUPER_ADMIN_EMAIL = "pranavm1911@gmail.com"; 

type UserRole = 'user' | 'admin' | 'superadmin' | 'guest'; 

const defaultNewEvent: Partial<CampusEvent> = {
  title: '',
  description: '',
  type: 'Tech', 
  date: new Date().toISOString(), 
  posterUrl: '',
  dataAiHint: '',
};


export default function EventsPage() {
  const [events, setEvents] = useState<CampusEvent[]>(placeholderEvents); 
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest'); 
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [currentEventData, setCurrentEventData] = useState<Partial<CampusEvent>>(defaultNewEvent);
  const [eventDialogDate, setEventDialogDate] = useState<Date | undefined>(new Date());
  const [eventDialogTime, setEventDialogTime] = useState<string>(format(new Date(), "HH:mm"));
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<CampusEvent[]>([]);
  
  const searchParams = useSearchParams();
  // const router = useRouter(); // Only needed if redirecting, which is not done here currently

  useEffect(() => {
    let isDemoSessionActive = false;
    const demoQueryParam = searchParams.get('isDemoSuperAdmin');
    const emailQueryParam = searchParams.get('email');

    if (demoQueryParam === 'true' && emailQueryParam === SUPER_ADMIN_EMAIL) {
      const mockSuperAdminUser = {
        uid: 'superadmin-demo-uid',
        email: SUPER_ADMIN_EMAIL,
        displayName: 'Super Admin (Demo)',
        providerData: [{ providerId: 'password' }] 
      } as User;
      setUser(mockSuperAdminUser);
      setUserRole('superadmin');
      isDemoSessionActive = true;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email === SUPER_ADMIN_EMAIL) {
            setUser(firebaseUser);
            setUserRole('superadmin');
        } else if (firebaseUser.email === ADMIN_EMAIL) {
            setUser(firebaseUser);
            setUserRole('admin');
        } else if (!isDemoSessionActive) { 
            setUser(firebaseUser);
            const isGoogleSignIn = firebaseUser.providerData.some(
                (provider) => provider.providerId === 'google.com'
            );
            setUserRole(isGoogleSignIn ? 'guest' : 'user');
        }
      } else {
        if (!isDemoSessionActive) {
          setUser(null);
          setUserRole('guest');
        }
      }
    });
    return () => unsubscribe();
  }, [searchParams]);


  const eventDates = React.useMemo(() => {
    return events.map(event => parseISO(event.date));
  }, [events]);

  const modifiers = {
    hasEvent: eventDates,
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold' as 'bold', 
      color: 'hsl(var(--primary))',
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
    },
  };
  
  useEffect(() => {
    if (selectedCalendarDate) {
      const filteredEvents = events.filter(event => 
        isSameDay(parseISO(event.date), selectedCalendarDate)
      );
      setEventsForSelectedDate(filteredEvents);
    } else {
      setEventsForSelectedDate([]);
    }
  }, [selectedCalendarDate, events]);


  const handleDialogInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentEventData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDialogEventTypeChange = (value: CampusEvent['type']) => {
    setCurrentEventData(prev => ({ ...prev, type: value }));
  };

  const handleDialogDateChange = (selectedDate: Date | undefined) => {
    setEventDialogDate(selectedDate);
  };

  const handleDialogTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventDialogTime(e.target.value);
  };

  const handleOpenAddEventDialog = () => {
    setEditingEventId(null);
    setCurrentEventData(defaultNewEvent); 
    setEventDialogDate(new Date()); 
    setEventDialogTime(format(new Date(), "HH:mm")); 
    setIsEventDialogOpen(true);
  };

  const handleOpenEditEventDialog = (event: CampusEvent) => {
    setEditingEventId(event.id);
    setCurrentEventData({
      title: event.title,
      description: event.description,
      type: event.type,
      posterUrl: event.posterUrl,
      dataAiHint: event.dataAiHint,
    });
    const dateObj = parseISO(event.date);
    setEventDialogDate(dateObj);
    setEventDialogTime(format(dateObj, "HH:mm"));
    setIsEventDialogOpen(true);
  };
  
  const handleSaveEvent = () => {
    if (!currentEventData.title || !eventDialogDate || !currentEventData.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Title, Date, Type).",
        variant: "destructive",
      });
      return;
    }

    const combinedDateTime = new Date(eventDialogDate);
    const [hours, minutes] = eventDialogTime.split(':').map(Number);
    combinedDateTime.setHours(hours, minutes);

    if (editingEventId) {
      // Editing existing event
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === editingEventId 
        ? { 
            ...event,
            title: currentEventData.title!,
            description: currentEventData.description || '',
            type: currentEventData.type!,
            date: combinedDateTime.toISOString(),
            posterUrl: currentEventData.posterUrl || 'https://placehold.co/400x600.png',
            dataAiHint: currentEventData.dataAiHint || `${currentEventData.type?.toLowerCase() ?? 'event'} poster`
          } 
        : event
      ));
      toast({
        title: "Event Updated",
        description: `Event "${currentEventData.title}" has been updated.`,
      });
    } else {
      // Adding new event
      const newEventToAdd: CampusEvent = {
          id: `e${events.length + 1}-${Date.now()}`, 
          title: currentEventData.title!,
          description: currentEventData.description || '',
          type: currentEventData.type!,
          date: combinedDateTime.toISOString(),
          posterUrl: currentEventData.posterUrl || 'https://placehold.co/400x600.png', 
          dataAiHint: currentEventData.dataAiHint || `${currentEventData.type?.toLowerCase() ?? 'event'} poster`
      };
      setEvents(prevEvents => [newEventToAdd, ...prevEvents]); // Add to beginning for visibility
      toast({
        title: "Event Added",
        description: `Event "${currentEventData.title}" has been added to the list.`,
      });
    }
    setIsEventDialogOpen(false);
    setEditingEventId(null);
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: `Event "${eventTitle}" has been removed.`,
      variant: "destructive",
    });
  };
  
  const canManageEvents = userRole === 'admin' || userRole === 'superadmin';

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Campus Events</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover what's happening on campus. Stay connected and get involved!
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Event Calendar</CardTitle>
          <CardDescription>
            Click on a date to see events. Dates with events are highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            <Calendar
              mode="single"
              selected={selectedCalendarDate}
              onSelect={setSelectedCalendarDate}
              className="rounded-md border w-full sm:w-auto mx-auto md:mx-0"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              initialFocus
            />
          </div>
          <div className="mt-4 md:mt-0">
            <h3 className="text-lg font-semibold mb-3">
              Events on {selectedCalendarDate ? format(selectedCalendarDate, 'PPP') : 'selected date'}:
            </h3>
            {eventsForSelectedDate.length > 0 ? (
              <ul className="space-y-3">
                {eventsForSelectedDate.map(event => (
                  <li key={event.id} className="p-3 bg-muted/50 rounded-md border">
                    <p className="font-semibold text-primary">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.description.substring(0,100)}{event.description.length > 100 ? "..." : ""}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="inline-block mr-1 h-3 w-3" />
                      {format(parseISO(event.date), 'p')}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 bg-muted/30 rounded-md border border-dashed">
                <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedCalendarDate ? "No events scheduled for this day." : "Select a date to see events."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-16 bg-background/90 py-4 z-10 rounded-md shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 border rounded-lg bg-card">
            <Input type="search" placeholder="Search events..." className="flex-grow w-full sm:w-auto" />
             <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Tech">Tech</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                </SelectContent>
            </Select>
            <Select defaultValue="this-month">
                <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="next-month">Next Month</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
                </SelectContent>
            </Select>
            {canManageEvents && (
              <Button onClick={handleOpenAddEventDialog} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Event
              </Button>
            )}
        </div>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingEventId ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {editingEventId ? 'Update the details for this campus event.' : "Fill in the details for the new campus event. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" name="title" value={currentEventData.title || ''} onChange={handleDialogInputChange} className="col-span-3" placeholder="Event Title" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" name="description" value={currentEventData.description || ''} onChange={handleDialogInputChange} className="col-span-3" placeholder="Event Description" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select name="type" value={currentEventData.type} onValueChange={handleDialogEventTypeChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !eventDialogDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIconLucide className="mr-2 h-4 w-4" />
                    {eventDialogDate ? format(eventDialogDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventDialogDate}
                    onSelect={handleDialogDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input id="time" name="time" type="time" value={eventDialogTime} onChange={handleDialogTimeChange} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="posterUrl" className="text-right">
                Poster URL
              </Label>
              <Input id="posterUrl" name="posterUrl" value={currentEventData.posterUrl || ''} onChange={handleDialogInputChange} className="col-span-3" placeholder="https://placehold.co/400x600.png" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataAiHint" className="text-right">
                AI Hint
              </Label>
              <Input id="dataAiHint" name="dataAiHint" value={currentEventData.dataAiHint || ''} onChange={handleDialogInputChange} className="col-span-3" placeholder="e.g. tech poster" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => { setIsEventDialogOpen(false); setEditingEventId(null); }}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div>
        <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                {event.posterUrl && (
                  <div className="aspect-[3/4] relative">
                    <Image 
                      src={event.posterUrl} 
                      alt={`${event.title} poster`} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      data-ai-hint={event.dataAiHint || `${event.type?.toLowerCase()} poster`} 
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                    {format(parseISO(event.date), 'PPP')}
                  </div>
                   <div className="flex items-center text-sm text-muted-foreground">
                     <Clock className="mr-2 h-4 w-4 text-primary" />
                    {format(parseISO(event.date), 'p')}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{event.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                     <MapPin className="mr-2 h-4 w-4 text-accent" /> Campus Auditorium {/* Placeholder location */}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex flex-col items-stretch gap-2">
                  <Button className="w-full">
                    <Ticket className="mr-2 h-4 w-4" />
                    RSVP / View Details
                  </Button>
                   {canManageEvents && (
                    <div className="mt-2 flex gap-2 justify-stretch">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpenEditEventDialog(event)}>
                          <Edit className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDeleteEvent(event.id, event.title)}>
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Info className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Events Scheduled</h3>
            <p className="mt-1 text-muted-foreground">
              {canManageEvents ? "No events yet. Why not add one?" : "Check back soon for updates on campus events."}
            </p>
            {canManageEvents && (
              <Button onClick={handleOpenAddEventDialog} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Event
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


    
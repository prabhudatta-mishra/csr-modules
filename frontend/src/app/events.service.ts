import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProjectsService } from './projects.service';
import { EmployeesService } from './employees.service';
import { NotificationService } from './notification.service';

export interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  seats: number;
}

export interface EventBooking {
  id: string;            // booking id
  eventId: number;
  userId: number | null; // 0 for admin or actual employee id
  name?: string;
  email?: string;
  profession?: string;
  date: string;          // ISO string
}

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly EVENTS_KEY = 'events.data';
  private readonly BOOKINGS_KEY = 'events.bookings';

  readonly events = signal<EventItem[]>([]);
  readonly bookings = signal<EventBooking[]>([]);

  constructor(private readonly auth: AuthService, private readonly projects: ProjectsService, private readonly employees: EmployeesService, private readonly notifications: NotificationService) {
    // seed events if not present
    const existing = localStorage.getItem(this.EVENTS_KEY);
    if (existing) {
      this.events.set(JSON.parse(existing));
    } else {
      const seed: EventItem[] = [
        { id: 1, title: 'Tree Plantation Drive', date: '2025-11-05', location: 'Campus Grounds', seats: 25 },
        { id: 2, title: 'Blood Donation Camp', date: '2025-11-12', location: 'Main Hall', seats: 10 },
        { id: 3, title: 'Beach Cleanup', date: '2025-12-02', location: 'City Beach', seats: 5 },
      ];
      this.events.set(seed);
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(seed));
    }
    const b = localStorage.getItem(this.BOOKINGS_KEY);
    this.bookings.set(b ? JSON.parse(b) : []);
  }

  list(): EventItem[] { return this.events(); }
  listBookings(): EventBooking[] { return this.bookings(); }

  book(eventId: number): { ok: boolean; message?: string } {
    const ev = this.events().find(e => e.id === eventId);
    if (!ev) return { ok: false, message: 'Event not found' };
    if (ev.seats <= 0) return { ok: false, message: 'No seats available' };
    const userId = this.auth.userId();
    const profile = this.auth.profile();
    const booking: EventBooking = {
      id: cryptoRandomId(),
      eventId: ev.id,
      userId,
      name: profile?.name,
      email: profile?.email,
      profession: profile?.profession,
      date: new Date().toISOString(),
    };
    // decrement seats
    const nextEvents = this.events().map(e => e.id === ev.id ? { ...e, seats: e.seats - 1 } : e);
    this.events.set(nextEvents);
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(nextEvents));

    const nextBookings = [booking, ...this.bookings()];
    this.bookings.set(nextBookings);
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(nextBookings));
    return { ok: true };
  }

  // Book against a Project (Option B): decrements project seats and records booking
  bookProject(projectId: number): { ok: boolean; message?: string } {
    const list = this.projects.list();
    const p = list.find(x => x.id === projectId);
    if (!p) return { ok: false, message: 'Project not found' };
    const seats = (p.seats ?? 0);
    if (seats <= 0) return { ok: false, message: 'No seats available' };
    // decrement seats in projects store
    this.projects.update(projectId, { seats: seats - 1 });

    const userId = this.auth.userId();
    const profile = this.auth.profile();
    // ensure employee exists in roster and assign the project
    if (profile) {
      const emp = this.employees.addOrGet({ name: profile.name, email: profile.email, profession: profile.profession });
      this.employees.assign(emp.id, projectId);
    }
    const booking: EventBooking = {
      id: cryptoRandomId(),
      eventId: projectId,
      userId,
      name: profile?.name,
      email: profile?.email,
      profession: profile?.profession,
      date: new Date().toISOString(),
    };
    const nextBookings = [booking, ...this.bookings()];
    this.bookings.set(nextBookings);
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(nextBookings));
    // notify admin
    const projectName = p.projectName ?? `#${projectId}`;
    this.notifications.push(`${profile?.name || 'User'} booked project "${projectName}"`);
    return { ok: true };
  }
}

function cryptoRandomId() {
  try {
    const a = new Uint8Array(8);
    crypto.getRandomValues(a);
    return Array.from(a).map(x => x.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

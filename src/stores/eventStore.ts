import { create } from "zustand";

type EventStore = {
  selected_event_id: string | null;
  setSelectedEventId: (id: string | null) => void;
};

export const useEventStore = create<EventStore>((set) => ({
  selected_event_id: null,
  setSelectedEventId: (id) => set({ selected_event_id: id }),
}));

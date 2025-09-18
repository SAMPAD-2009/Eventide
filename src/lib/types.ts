export interface Event {
  id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  category: string;
  datetime: string;
  isIndefinite?: boolean;
  event_id?: string; // a.k.a Baserow row ID
}

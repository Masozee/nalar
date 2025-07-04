export interface Speaker {
  name: string;
  affiliation: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: string;
  description: string;
  imageUrl: string;
  speakers: Speaker[];
  registrationLink: string;
  attendance?: number;
  sessions?: number;
}

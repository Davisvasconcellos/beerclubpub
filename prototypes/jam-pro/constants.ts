
import { Song } from './types';

export const INITIAL_SONGS: Song[] = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    singers: [
      { id: 's1', name: 'Ricardo', image: 'https://picsum.photos/seed/p1/200', instrument: 'Guitarra' },
      { id: 's2', name: 'Amanda', image: 'https://picsum.photos/seed/p2/200', instrument: 'Vocals' },
      { id: 's3', name: 'Carlos', image: 'https://picsum.photos/seed/p3/200', instrument: 'Bateria' },
    ]
  },
  {
    id: '2',
    title: 'Dancing Queen',
    artist: 'ABBA',
    singers: [
      { id: 's4', name: 'Juliana', image: 'https://picsum.photos/seed/p4/200', instrument: 'Vocals' },
      { id: 's5', name: 'Marcos', image: 'https://picsum.photos/seed/p5/200', instrument: 'Teclado' },
    ]
  },
  {
    id: '3',
    title: 'Like a Prayer',
    artist: 'Madonna',
    singers: [
      { id: 's6', name: 'Beatriz', image: 'https://picsum.photos/seed/p6/200', instrument: 'Vocals' },
    ]
  },
  {
    id: '4',
    title: 'Wonderwall',
    artist: 'Oasis',
    singers: [
      { id: 's7', name: 'Pedro', image: 'https://picsum.photos/seed/p7/200', instrument: 'Violão' },
      { id: 's8', name: 'Sofia', image: 'https://picsum.photos/seed/p8/200', instrument: 'Vocals' },
    ]
  }
];

export const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'
];

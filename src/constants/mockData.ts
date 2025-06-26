import { Movie, TVShow, ContentRow } from '../types';

export const featuredMovie: Movie = {
  id: 'fury-2014',
  title: 'FURY',
  description: 'April, 1945. As the Allies make their final push in the European Theatre, a battle-hardened Army sergeant named Wardaddy commands a Sherman tank and his five-man crew on a deadly mission behind enemy lines.',
  posterUrl: 'https://image.tmdb.org/t/p/w500/pfte7wdMobMF4CVHuOxyu6oqeeA.jpg',
  backdropUrl: 'https://image.tmdb.org/t/p/original/pKRKvDl3zLZTJUhA7Mr3FL3VieR.jpg',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  runtime: 134,
  rating: 'R',
  year: 2014,
  genres: ['Action', 'Drama', 'War'],
  cast: [
    { id: '1', name: 'Brad Pitt', character: 'Don "Wardaddy" Collier' },
    { id: '2', name: 'Shia LaBeouf', character: 'Boyd "Bible" Swan' },
    { id: '3', name: 'Logan Lerman', character: 'Norman "Machine" Ellison' },
    { id: '4', name: 'Michael Peña', character: 'Trini "Gordo" Garcia' },
    { id: '5', name: 'Jon Bernthal', character: 'Grady "Coon-Ass" Travis' },
  ],
  director: 'David Ayer',
  featured: true,
};

export const movies: Movie[] = [
  featuredMovie,
  {
    id: 'hundred-foot-journey',
    title: 'The Hundred-Foot Journey',
    description: 'A story centered around an Indian family who moves to France and opens a restaurant across from a Michelin-starred French restaurant.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qyFURqk8subR431xOYWOKj4jpRJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7q4COkz5oVqEcawLlEGgeCrx6J4.jpg',
    runtime: 122,
    rating: 'PG',
    year: 2014,
    genres: ['Comedy', 'Drama'],
    cast: [
      { id: '6', name: 'Helen Mirren', character: 'Madame Mallory' },
      { id: '7', name: 'Om Puri', character: 'Papa' },
    ],
    director: 'Lasse Hallström',
  },
  {
    id: 'forrest-gump',
    title: 'Forrest Gump',
    description: 'The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man with an IQ of 75.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxzVaenNXOhsP.jpg',
    runtime: 142,
    rating: 'PG-13',
    year: 1994,
    genres: ['Drama', 'Romance'],
    cast: [
      { id: '8', name: 'Tom Hanks', character: 'Forrest Gump' },
      { id: '9', name: 'Robin Wright', character: 'Jenny Curran' },
    ],
    director: 'Robert Zemeckis',
  },
  {
    id: 'deadpool',
    title: 'Deadpool',
    description: 'A wisecracking mercenary gets experimented on and becomes immortal but ugly, and sets out to track down the man who ruined his looks.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/yGSxMiF0cYuAiyuve5DA6bnWBIf.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/n1y094tVDFATSzkTnFxoGZ1qNsG.jpg',
    runtime: 108,
    rating: 'R',
    year: 2016,
    genres: ['Action', 'Comedy', 'Adventure'],
    cast: [
      { id: '10', name: 'Ryan Reynolds', character: 'Wade Wilson / Deadpool' },
      { id: '11', name: 'Morena Baccarin', character: 'Vanessa' },
    ],
    director: 'Tim Miller',
  },
];

export const tvShows: TVShow[] = [
  {
    id: 'brooklyn-nine-nine',
    title: 'Brooklyn Nine-Nine',
    description: 'Comedy series following the exploits of Det. Jake Peralta and his diverse, lovable colleagues as they police the NYPD\'s 99th Precinct.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hgRMSOt7a1b8qyQR68vUixJPang.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/ncC9ZgZuKOdaVm7yXinUn26Qyok.jpg',
    rating: 'TV-14',
    year: 2013,
    genres: ['Comedy', 'Crime'],
    cast: [
      { id: '12', name: 'Andy Samberg', character: 'Jake Peralta' },
      { id: '13', name: 'Melissa Fumero', character: 'Amy Santiago' },
    ],
    seasons: 8,
    episodes: 153,
    status: 'completed',
  },
  {
    id: 'big-bang-theory',
    title: 'The Big Bang Theory',
    description: 'A woman who moves into an apartment across the hall from two brilliant but socially awkward physicists shows them how little they know about life outside of the laboratory.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nGsNruW3W27V6r4gkyc3GyMdNcH.jpg',
    rating: 'TV-PG',
    year: 2007,
    genres: ['Comedy'],
    cast: [
      { id: '14', name: 'Jim Parsons', character: 'Sheldon Cooper' },
      { id: '15', name: 'Johnny Galecki', character: 'Leonard Hofstadter' },
    ],
    seasons: 12,
    episodes: 279,
    status: 'completed',
  },
];

export const contentRows: ContentRow[] = [
  {
    id: 'trending',
    title: 'Trending Now',
    type: 'mixed',
    items: [...movies, ...tvShows],
  },
  {
    id: 'action-movies',
    title: 'Action Movies',
    type: 'movie',
    items: movies.filter(movie => movie.genres.includes('Action')),
  },
  {
    id: 'comedies',
    title: 'Comedy Series',
    type: 'tvshow',
    items: tvShows.filter(show => show.genres.includes('Comedy')),
  },
]; 
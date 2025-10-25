// BGG API Types
export interface BGGCollectionItem {
  objecttype: string;
  objectid: string;
  subtype: string;
  collid: string;
  name: string;
  yearpublished?: string;
  image?: string;
  thumbnail?: string;
  stats?: {
    minplayers?: string;
    maxplayers?: string;
    minplaytime?: string;
    maxplaytime?: string;
    playingtime?: string;
    numowned?: string;
    rating?: {
      usersrated?: string;
      average?: {
        value: string;
      };
      bayesaverage?: string;
      stddev?: string;
      median?: string;
      ranks?: {
        rank: Array<{
          type: string;
          id: string;
          name: string;
          friendlyname: string;
          value: string;
          bayesaverage: string;
        }>;
      };
    };
  };
  status?: {
    own?: string;
    prevowned?: string;
    fortrade?: string;
    want?: string;
    wanttoplay?: string;
    wanttobuy?: string;
    wishlist?: string;
    preordered?: string;
    lastmodified?: string;
  };
  numplays?: string;
  comment?: string;
}

export interface BGGThing {
  type: string;
  id: string;
  thumbnail?: string;
  image?: string;
  name:
    | Array<{ type: string; sortindex: string; value: string }>
    | { type: string; sortindex: string; value: string };
  description?: string;
  yearpublished?: { value: string };
  minplayers?: { value: string };
  maxplayers?: { value: string };
  playingtime?: { value: string };
  minplaytime?: { value: string };
  maxplaytime?: { value: string };
  minage?: { value: string };
  poll?: Array<{
    name: string;
    title: string;
    totalvotes: string;
    results?: unknown;
  }>;
  link?: Array<{
    type: string;
    id: string;
    value: string;
  }>;
  statistics?: {
    ratings?: {
      usersrated?: { value: string };
      average?: { value: string };
      bayesaverage?: { value: string };
      stddev?: { value: string };
      median?: { value: string };
      owned?: { value: string };
      trading?: { value: string };
      wanting?: { value: string };
      wishing?: { value: string };
      numcomments?: { value: string };
      numweights?: { value: string };
      averageweight?: { value: string };
      ranks?: {
        rank:
          | Array<{
              type: string;
              id: string;
              name: string;
              friendlyname: string;
              value: string;
              bayesaverage: string;
            }>
          | {
              type: string;
              id: string;
              name: string;
              friendlyname: string;
              value: string;
              bayesaverage: string;
            };
      };
    };
  };
}

// Normalized Game Data
export interface GameData {
  id: string;
  name: string;
  thumbnail?: string;
  image?: string;
  yearPublished?: number;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  minPlayTime?: number;
  maxPlayTime?: number;
  complexity?: number;
  rating?: number;
  rank?: number;
  numOwned?: number;
  owners: string[]; // List of usernames who own this game
}

// Filter State
export interface FilterState {
  playerCount?: number;
  minPlayTime?: number;
  maxPlayTime?: number;
  minComplexity?: number;
  maxComplexity?: number;
  minRating?: number;
  search?: string;
  sortBy?: "name" | "rating" | "rank" | "complexity" | "playingTime" | "owners";
  sortOrder?: "asc" | "desc";
}

// Collection Response
export interface CollectionResponse {
  items: {
    item: BGGCollectionItem[] | BGGCollectionItem;
  };
}

export interface ThingResponse {
  items: {
    item: BGGThing[] | BGGThing;
  };
}

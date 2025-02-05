export interface RoleNickPair {
  role: string;
  nick: string;
}

export interface Player {
  nick: string;
  role: string;
  damage: string;
  points: number;
}

export interface TextDG {
  general: string;
  healers: string;
  tank: string;
}

export interface InsertMeeterProps {
  dungeon: any;
  morList: any;
}
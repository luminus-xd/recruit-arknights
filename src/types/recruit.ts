export type Rarity = 1 | 2 | 3 | 4 | 5 | 6;
export type Position = "近距離" | "遠距離";
export type Type =
  | "先鋒"
  | "前衛"
  | "狙撃"
  | "術師"
  | "重装"
  | "医療"
  | "補助"
  | "特殊";

export type RerityTag = "ロボット" | "エリート" | "上級エリート";

export type Tag =
  | "初期"
  | "火力"
  | "生存"
  | "防御"
  | "治療"
  | "支援"
  | "範囲攻撃"
  | "減速"
  | "牽制"
  | "弱化"
  | "COST回復"
  | "強制移動"
  | "爆発力"
  | "召喚"
  | "高速再配置"
  | "元素";

export type Recruit = Operator[];

export type Operator = {
  id: number;
  name: string;
  rarity: Rarity;
  type: Type;
  tags: Tag[];
  addDay: string;
  wiki: string;
  imgPath: string;
};

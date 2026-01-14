export const LEVELS = {
  beginner: '初心者',
  novice: '初級',
  intermediate: '中級',
  advanced: '上級',
  all: '全レベル',
} as const

export type LevelKey = keyof typeof LEVELS

export const MIYAGI_CITIES = [
  '仙台市青葉区',
  '仙台市宮城野区',
  '仙台市若林区',
  '仙台市太白区',
  '仙台市泉区',
  '石巻市',
  '塩竈市',
  '気仙沼市',
  '白石市',
  '名取市',
  '角田市',
  '多賀城市',
  '岩沼市',
  '登米市',
  '栗原市',
  '東松島市',
  '大崎市',
  '富谷市',
  '蔵王町',
  '七ヶ宿町',
  '大河原町',
  '村田町',
  '柴田町',
  '川崎町',
  '丸森町',
  '亘理町',
  '山元町',
  '松島町',
  '七ヶ浜町',
  '利府町',
  '大和町',
  '大郷町',
  '大衡村',
  '色麻町',
  '加美町',
  '涌谷町',
  '美里町',
  '女川町',
  '南三陸町',
] as const

export const APPLICATION_STATUS = {
  pending: '申請中',
  approved: '承認済み',
  rejected: '不参加',
  canceled: 'キャンセル',
} as const

export const EVENT_STATUS = {
  published: '募集中',
  canceled: '中止',
} as const

export const QUICK_MESSAGES = [
  '入口が分からず迷っています',
  '到着が遅れます',
  '体調不良でキャンセルします',
] as const

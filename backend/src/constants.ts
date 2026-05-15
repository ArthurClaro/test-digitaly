export const BOARD_SIZES = ['9x9', '16x16', '30x16'] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export const RANKING_LIMIT = 30;
export const JWT_ALGORITHM = 'HS256' as const;

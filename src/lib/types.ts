export interface ChatTurn {
  name: string;
  avatar: string;
  image: string | null;
  message: string;
  status: "waiting" | "done";
  type: "user" | "assistant";
};

export enum ChatType {
  Grounded,
  Visual,
  Video,
  PromptFlow
};

export interface Product {
  id: number;
  name: string;
  nameZh?: string; // 添加中文名称字段
  price: number;
  category: string;
  brand: string;
  description: string;
  descriptionZh?: string; // 添加中文描述字段
  slug: string;
  manual: string;
  images: string[];
  summaryOfReviewComments: string;
  summaryOfReviewCommentsZh?: string; // 添加中文评论摘要
};

export interface ProductGroup {
    name: string;
    nameZh?: string; // 添加中文名称字段
    slug: string;
    description: string;
    descriptionZh?: string; // 添加中文描述字段
    products: Product[];
};

export interface Citation {
  index: number;
  productId: number;
  slug: string;
  chunk: string;
  manual: string;
  replace: string;
};

export interface GroundedMessage {
  message: string;
  citations: Citation[];
};

// TTS Audio interfaces
export interface TTSRequest {
  text: string;
  language: 'en' | 'zh';
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}

export interface TTSResponse {
  audioUrl: string;
  error?: string;
}

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

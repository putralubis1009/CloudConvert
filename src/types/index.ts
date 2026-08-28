export interface FeatureItem {
  id: string;
  iconName: "Code2" | "Search" | "MoonStar" | "Palette" | "Smartphone" | "Zap";
  title: string;
  description: string;
  codeHighlight?: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  codeSnippet?: string;
}

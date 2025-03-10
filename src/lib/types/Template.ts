export interface TemplateParameter {
  type: string;
  description: string;
  required: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  parameters: Record<string, TemplateParameter>;
} 
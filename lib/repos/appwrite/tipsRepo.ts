import type { CreateTipInput } from "@/lib/validation/tips";

export interface TipsRepo {
  create(input: CreateTipInput, ownerId: string): Promise<{ id: string }>;
  list(/* your filter */): Promise<{ items: any[] }>;
  toggleHelpful(tipId: string, userId: string): Promise<void>;
  report(tipId: string, userId: string): Promise<void>;
}

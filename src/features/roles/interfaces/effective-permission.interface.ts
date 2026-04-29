export interface IEffectivePermission {
  id: string;
  name: string;
  category: string;
  actionKey: string;
  description: string;
  inBaseline: boolean;
  overrideEffect: "grant" | "deny" | null;
  isEffective: boolean;
}

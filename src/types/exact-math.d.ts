declare module "exact-math" {
  export function add(...args: number[]): number;
  export function sub(...args: number[]): number;
  export function mul(...args: number[]): number;
  export function div(...args: number[]): number;
  export function round(value: number, precision?: number): number;
}

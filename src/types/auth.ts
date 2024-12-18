export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  image: string;
  role: unknown;
  country: "usa" | "CA";
  bio: string;
  preferredExchange: string;
}

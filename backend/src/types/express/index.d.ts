import { UserRole } from "../../constants/enums";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};

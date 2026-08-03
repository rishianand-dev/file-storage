export type AuthenticatedUser = {
  id: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` middleware. */
      user?: AuthenticatedUser;
    }
  }
}

export {};

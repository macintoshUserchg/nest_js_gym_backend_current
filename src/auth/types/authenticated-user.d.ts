/**
 * Shape of `request.user` after JwtStrategy.validate() resolves.
 *
 * The JWT itself only carries `{ sub, email, role }` (see AuthJwtPayload);
 * `gymId` and `branchId` are loaded fresh from the database on every request
 * inside the strategy, so tenant guards always act on current membership.
 */
export type AuthenticatedUser = {
  userId: string;
  email: string;
  role: string;
  gymId?: string;
  branchId?: string;
};

const BIDDER_PATHS = ["/app/bid/invitations"];

export function bidderMayVisit(pathname: string) {
  return BIDDER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export class CreateAuditLogDto {
  userId?: number | null;

  userName?: string | null;

  action?: string | null;

  module?: string | null;

  recordId?: number | null;

  description?: string | null;

  oldData?: unknown;

  newData?: unknown;

  ipAddress?: string | null;

  userAgent?: string | null;
}

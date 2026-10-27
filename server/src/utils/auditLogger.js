import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  req,
  actor,
  action,
  entityType,
  entityId,
  details = {},
}) => {
  try {
    const user = actor || req?.user;
    const ipAddress =
      req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers['user-agent'] || '';

    await AuditLog.create({
      actor: user?._id || user?.id || null,
      actorName: user?.name || 'System',
      actorEmail: user?.email || '',
      actorRole: user?.role || 'system',
      action,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      details,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};

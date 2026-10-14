'use client';

import { useApp } from '../../../context/AppContext';
import AuditLogsView from '../../../components/admin/audit/AuditLogsView';

export default function AdminAuditLogsPage() {
  const { isDark } = useApp();
  return <AuditLogsView isDark={isDark}/>;
}

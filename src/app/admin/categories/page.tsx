'use client';

import { useApp } from '../../../context/AppContext';
import AdminCategoryCatalog from '../../../components/admin/AdminCategoryCatalog';

export default function AdminCategories() {
  const { isDark } = useApp();
  return <AdminCategoryCatalog isDark={isDark} />;
}

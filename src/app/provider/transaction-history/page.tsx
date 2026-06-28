"use client";
import React from 'react';
import { useApp } from '../../../context/AppContext';
import TransactionHistory from '../../../components/provider/TransactionHistory';

export default function TransactionHistoryPage() {
  const { user } = useApp();
  return <TransactionHistory currentUserId={user?.id} />;
}

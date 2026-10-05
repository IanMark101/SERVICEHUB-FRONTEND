"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PostRequest from '../../../components/seeker/PostRequest';

function PostRequestContent() {
  const searchParams = useSearchParams();
  return <PostRequest appealRequestId={searchParams.get('appealRequestId') ?? ''} />;
}

export default function PostRequestPage() {
  return <Suspense fallback={<p className="p-6 text-sm opacity-70">Loading request form…</p>}><PostRequestContent /></Suspense>;
}

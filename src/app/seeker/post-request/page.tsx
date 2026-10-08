"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PostRequest from '../../../components/seeker/PostRequest';
import RepostRequestForm from '../../../components/seeker/RepostRequestForm';

function PostRequestContent() {
  const searchParams = useSearchParams();
  const repostId = searchParams.get('repost');
  return repostId ? <RepostRequestForm key={repostId} requestId={repostId} /> : <PostRequest appealRequestId={searchParams.get('appealRequestId') ?? ''} />;
}

export default function PostRequestPage() {
  return <Suspense fallback={<p className="p-6 text-sm opacity-70">Loading request form…</p>}><PostRequestContent /></Suspense>;
}

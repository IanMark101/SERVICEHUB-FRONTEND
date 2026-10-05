import BrandLoading from '@/components/ui/BrandLoading';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50">
      <BrandLoading label="Loading help guide" />
    </div>
  );
}

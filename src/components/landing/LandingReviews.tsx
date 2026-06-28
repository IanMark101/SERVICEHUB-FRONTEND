import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface Review {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  feedback: string;
}

const mockReviews: Review[] = [
  {
    id: 'rev-1',
    name: 'Aria Blackwood',
    role: 'Product Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    feedback: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget libero ac nisi convallis eleifend. Mauris nec enim et sem aliquet viverra. Sed ornare mauris eu nunc consectetur, nec cursus sem suscipit. Proin ac diam ac mi malesuada pharetra. Nulla facilisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis sollicitudin sapien td turpis dapibus, primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer auctor est id interdum mollis. Sed et justo velit. Nam nec tempor dui, eget faucibus felis. Aliquam id erat ac sapien tincidunt tempor. Donec ac justo quis enim aliquet vestibulum.'
  },
  {
    id: 'rev-2',
    name: 'Junrel Bacalso',
    role: 'Electrical & Aircon Expert',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    feedback: 'Managing my local bookings and job queues here in Cordova is incredibly smooth. I switch to my provider workspace to service appliances, and switch back to seeker when I need laundry services. The GCash escrow system works perfectly on both sides. A secure, neighborly ecosystem that makes local transactions safe!'
  },
  {
    id: 'rev-3',
    name: 'Sarah Jenkins',
    role: 'Academic Tutor',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    feedback: 'I teach math classes in the afternoon and hire local errand runners in the morning. Having both roles integrated under a single, unified profile means my trust score follows me everywhere. The started-based cancellation policy gives me absolute peace of mind as both a service client and provider.'
  },
  {
    id: 'rev-4',
    name: 'Alex Mercer',
    role: 'Cordova Resident',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    feedback: 'Extremely easy to search and sort for local services. Navigated to local listings, booked a provider directly with direct payment options, and released payment only after the service was marked completed. Clean layout, loading shimmers are super quick, and dashboard navigation is effortless.'
  }
];

interface LandingReviewsProps {
  isDark: boolean;
}

export default function LandingReviews({ isDark }: LandingReviewsProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? mockReviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === mockReviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className={`pt-10 pb-16 md:pt-12 md:pb-16 px-6 md:px-12 border-b overflow-hidden relative transition-colors duration-500 ${
      isDark ? 'bg-[#121210] border-neutral-850/40 text-[#f2efe9]' : 'bg-[#f7f6f2] border-slate-200 text-slate-800'
    }`}>
      {/* Decorative background glows */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl -z-10 pointer-events-none opacity-40 ${
        isDark ? 'bg-amber-955/15' : 'bg-amber-100/30'
      }`} />

      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Pagination Dots at the very top (matching user image layout) */}
        <div className="flex space-x-2 mb-4">
          {mockReviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? isDark ? 'bg-[#f2efe9] scale-110' : 'bg-slate-800 scale-110'
                  : isDark ? 'bg-neutral-800' : 'bg-slate-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <ScrollReveal className="text-center mb-6">
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
            isDark ? 'text-[#f2efe9]' : 'text-slate-900'
          }`}>
            See what our clients have to say
          </h2>
        </ScrollReveal>

        {/* Carousel Container */}
        <div className="w-full relative flex items-center justify-center min-h-[330px] md:min-h-[360px] h-[330px] md:h-[360px]">
          
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className={`absolute left-0 sm:left-4 z-30 p-2.5 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
              isDark 
                ? 'bg-[#22211e]/80 border-neutral-800 hover:bg-[#2c2b27] text-neutral-450 hover:text-white' 
                : 'bg-white/80 border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'
            }`}
            aria-label="Previous Review"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>

          {/* 3D Coverflow Track */}
          <div className="w-full max-w-[900px] flex items-center justify-center relative select-none">
            {mockReviews.map((review, idx) => {
              // Calculate relative offset of card compared to activeIndex
              let diff = idx - activeIndex;
              
              // Handle wrap-around for smooth looping offsets
              if (diff < -1) {
                if (diff === -(mockReviews.length - 1)) diff = 1;
              } else if (diff > 1) {
                if (diff === mockReviews.length - 1) diff = -1;
              }

              const isFocus = diff === 0;
              const isLeft = diff === -1;
              const isRight = diff === 1;
              const isHidden = Math.abs(diff) > 1;

              let cardStyles = '';
              if (isFocus) {
                cardStyles = 'z-20 scale-100 opacity-100 translate-x-0 cursor-default';
              } else if (isLeft) {
                cardStyles = 'z-10 scale-85 opacity-40 -translate-x-[20%] md:-translate-x-[35%] cursor-pointer rotate-y-12';
              } else if (isRight) {
                cardStyles = 'z-10 scale-85 opacity-40 translate-x-[20%] md:translate-x-[35%] cursor-pointer -rotate-y-12';
              } else {
                cardStyles = 'z-0 scale-75 opacity-0 pointer-events-none absolute';
              }

              return (
                <div
                  key={review.id}
                  onClick={() => !isFocus && setActiveIndex(idx)}
                  className={`w-full max-w-[280px] md:max-w-[340px] p-5 sm:p-6 rounded-[24px] border backdrop-blur-xl transition-all duration-550 ease-out absolute ${cardStyles} ${
                    isDark 
                      ? 'bg-[#1c1b18]/90 border-neutral-800/80 text-[#f2efe9] shadow-xl' 
                      : 'bg-white border-slate-200 text-slate-800 shadow-lg'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                >
                  {/* Top user profile section */}
                  <div className="flex items-center space-x-3.5 mb-3.5 pb-3 border-b border-slate-100 dark:border-neutral-850">
                    <img
                      src={review.avatarUrl}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/30"
                    />
                    <div>
                      <p className={`text-[9px] uppercase font-bold tracking-wider ${
                        isDark ? 'text-amber-500' : 'text-orange-600'
                      }`}>
                        Verified Reviewer
                      </p>
                      <h4 className="font-bold text-xs sm:text-sm leading-tight">
                        {review.name}
                      </h4>
                      <p className={`text-[10px] font-medium ${
                        isDark ? 'text-[#b4b0a9]' : 'text-slate-450'
                      }`}>
                        {review.role}
                      </p>
                    </div>
                  </div>

                  {/* Feedback comment paragraph */}
                  <p className={`text-[11px] leading-relaxed font-medium overflow-y-auto max-h-[170px] transition-colors duration-300 pr-1 ${
                    isDark ? 'text-[#b4b0a9]' : 'text-slate-600'
                  }`}>
                    {review.feedback}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className={`absolute right-0 sm:right-4 z-30 p-2.5 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
              isDark 
                ? 'bg-[#22211e]/80 border-neutral-800 hover:bg-[#2c2b27] text-neutral-450 hover:text-white' 
                : 'bg-white/80 border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'
            }`}
            aria-label="Next Review"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>

        </div>
      </div>
    </section>
  );
}

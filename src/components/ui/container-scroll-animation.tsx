"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, type MotionValue, type UseScrollOptions } from "motion/react";
import useHydratedReducedMotion from '@/hooks/useHydratedReducedMotion';
import { cn } from "@/lib/utils";

// Restored Aceternity CLI component from repository history (f85d87c^).
// Layout hooks let the original tablet fit the existing workspace section.

export const ContainerScroll = ({
  titleComponent,
  children,
  className,
  innerClassName,
  cardClassName,
  contentClassName,
  offset,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  cardClassName?: string;
  contentClassName?: string;
  offset?: UseScrollOptions["offset"];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useHydratedReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -100]);

  return (
    <div
      className={cn("h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20", className)}
      ref={containerRef}
      data-container-scroll
    >
      <div
        className={cn("py-10 md:py-40 w-full relative", innerClassName)}
        style={{
          perspective: "1000px",
        }}
      >
        {titleComponent != null && <Header translate={translate} titleComponent={titleComponent} />}
        <Card rotate={rotate} translate={translate} scale={scale} className={cardClassName} contentClassName={contentClassName}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
  className,
  contentClassName,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className={cn("max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl", className)}
      data-container-scroll-card
    >
      <div className={cn("h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4", contentClassName)}>
        {children}
      </div>
    </motion.div>
  );
};

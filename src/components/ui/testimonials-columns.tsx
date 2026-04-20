"use client";
import Image from "next/image";
import React, { useState } from "react";

export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  const [paused, setPaused] = useState(false);
  const duration = props.duration || 10;

  return (
    <div
      className={props.className}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex flex-col gap-6 pb-6 bg-background"
        style={{
          animation: `testimonial-scroll ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div className="p-10 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full" key={i}>
                <div>{text}</div>
                <div className="flex items-center gap-2 mt-5">
                  <Image
                    width={40}
                    height={40}
                    sizes="40px"
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <div className="font-medium tracking-tight leading-5">{name}</div>
                    <div className="leading-5 opacity-60 tracking-tight">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

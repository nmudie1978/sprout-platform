import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RealityVideos } from "../reality-videos";
import type { RealityVideo } from "@/lib/career-reality-types";

function makeVideos(n: number): RealityVideo[] {
  return Array.from({ length: n }, (_, i) => ({
    videoId: `vid${i}`,
    title: `Reality video ${i}`,
    channel: `Channel ${i}`,
    thumbnailUrl: `https://img/${i}.jpg`,
    whySelected: "honest",
    videoType: "balanced" as const,
  }));
}

const countPlayers = () => document.querySelectorAll("iframe").length;

describe("RealityVideos", () => {
  it("renders nothing when there are no videos", () => {
    const { container } = render(<RealityVideos videos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows all videos and no 'show more' when there are 3 or fewer", () => {
    render(<RealityVideos videos={makeVideos(3)} />);
    expect(countPlayers()).toBe(3);
    expect(screen.queryByRole("button", { name: /show .* more/i })).not.toBeInTheDocument();
  });

  it("shows only the first 3 and a 'show 5 more' button for a pool of 8", () => {
    render(<RealityVideos videos={makeVideos(8)} />);
    expect(countPlayers()).toBe(3);
    expect(screen.getByRole("button", { name: /show 5 more videos/i })).toBeInTheDocument();
  });

  it("reveals the rest of the pool when 'show more' is clicked, then hides the button", () => {
    render(<RealityVideos videos={makeVideos(8)} />);
    fireEvent.click(screen.getByRole("button", { name: /show 5 more videos/i }));
    expect(countPlayers()).toBe(8);
    expect(screen.queryByRole("button", { name: /show .* more/i })).not.toBeInTheDocument();
  });

  it("uses singular 'video' when exactly one more is hidden", () => {
    render(<RealityVideos videos={makeVideos(4)} />);
    expect(screen.getByRole("button", { name: /show 1 more video$/i })).toBeInTheDocument();
  });
});

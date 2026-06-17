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
const countTiles = () => screen.getAllByRole("button", { name: /^Play:/i }).length;

describe("RealityVideos", () => {
  it("renders nothing when there are no videos", () => {
    const { container } = render(<RealityVideos videos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders every video in the pool as a tile (carousel, no 'show more')", () => {
    render(<RealityVideos videos={makeVideos(8)} />);
    expect(countTiles()).toBe(8);
    expect(
      screen.queryByRole("button", { name: /show .* more/i }),
    ).not.toBeInTheDocument();
  });

  it("does not mount any player until a tile is clicked (lightweight thumbnails)", () => {
    render(<RealityVideos videos={makeVideos(3)} />);
    expect(countPlayers()).toBe(0);
  });

  it("mounts a player only for the clicked video", () => {
    render(<RealityVideos videos={makeVideos(3)} />);
    fireEvent.click(screen.getByRole("button", { name: /play: reality video 1/i }));
    const frames = Array.from(document.querySelectorAll("iframe"));
    expect(frames).toHaveLength(1);
    expect(frames[0].getAttribute("src")).toContain("vid1");
  });

  it("shows carousel nav arrows when there is more than one video", () => {
    render(<RealityVideos videos={makeVideos(4)} />);
    expect(screen.getByRole("button", { name: /previous videos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /more videos/i })).toBeInTheDocument();
  });

  it("hides the nav arrows when there is only one video", () => {
    render(<RealityVideos videos={makeVideos(1)} />);
    expect(screen.queryByRole("button", { name: /previous videos/i })).not.toBeInTheDocument();
  });
});

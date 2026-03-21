/**
 * Shared SVG path utilities for roadmap components.
 * Used by JourneyRoadmap (D→U→A).
 */

/**
 * Generate a horizontal S-curve path for desktop layout.
 */
export function generateDesktopPath(nodeCount: number): string {
  const width = 100;
  const segmentWidth = width / (nodeCount - 1);

  let path = 'M 5 50';

  for (let i = 1; i < nodeCount; i++) {
    const x = 5 + (i * segmentWidth * 0.9);
    const prevX = 5 + ((i - 1) * segmentWidth * 0.9);
    const midX = (prevX + x) / 2;

    const yOffset = (i % 2 === 0) ? 35 : 65;
    const prevYOffset = ((i - 1) % 2 === 0) ? 35 : 65;

    path += ` Q ${midX} ${prevYOffset}, ${x} ${yOffset}`;
  }

  return path;
}

/**
 * Generate a vertical winding path for mobile layout.
 */
export function generateMobilePath(nodeCount: number): string {
  const height = 100;
  const segmentHeight = height / (nodeCount - 1);

  let path = 'M 50 5';

  for (let i = 1; i < nodeCount; i++) {
    const y = 5 + (i * segmentHeight * 0.9);
    const prevY = 5 + ((i - 1) * segmentHeight * 0.9);
    const midY = (prevY + y) / 2;

    const xOffset = (i % 2 === 0) ? 30 : 70;
    const prevXOffset = ((i - 1) % 2 === 0) ? 30 : 70;

    path += ` Q ${prevXOffset} ${midY}, ${xOffset} ${y}`;
  }

  return path;
}

/**
 * Get the position of a node on the SVG path.
 */
export function getNodePosition(
  index: number,
  total: number,
  isMobile: boolean
): { x: number; y: number } {
  if (isMobile) {
    const segmentHeight = 90 / (total - 1);
    const y = 5 + (index * segmentHeight);
    const x = (index % 2 === 0) ? 30 : 70;
    return { x, y };
  } else {
    const segmentWidth = 90 / (total - 1);
    const x = 5 + (index * segmentWidth);
    const y = (index % 2 === 0) ? 35 : 65;
    return { x, y };
  }
}

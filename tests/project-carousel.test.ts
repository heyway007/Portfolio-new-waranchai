import { describe, expect, it } from "vitest";
import {
  getProjectsPerSlide,
  getProjectSlideCount,
  getVisibleProjectSlice,
  wrapProjectSlideIndex,
} from "../app/components/portfolio/project-carousel";

describe("project carousel", () => {
  it("uses three, two, and one cards at the approved breakpoints", () => {
    expect(getProjectsPerSlide(1440)).toBe(3);
    expect(getProjectsPerSlide(1200)).toBe(3);
    expect(getProjectsPerSlide(1199)).toBe(2);
    expect(getProjectsPerSlide(761)).toBe(2);
    expect(getProjectsPerSlide(760)).toBe(1);
  });

  it("counts partial slides and handles an empty collection", () => {
    expect(getProjectSlideCount(10, 3)).toBe(4);
    expect(getProjectSlideCount(6, 3)).toBe(2);
    expect(getProjectSlideCount(0, 3)).toBe(0);
  });

  it("wraps navigation in either direction", () => {
    expect(wrapProjectSlideIndex(4, 4)).toBe(0);
    expect(wrapProjectSlideIndex(-1, 4)).toBe(3);
    expect(wrapProjectSlideIndex(8, 0)).toBe(0);
  });

  it("returns only the active project page", () => {
    const projects = ["a", "b", "c", "d", "e"];
    expect(getVisibleProjectSlice(projects, 0, 3)).toEqual(["a", "b", "c"]);
    expect(getVisibleProjectSlice(projects, 1, 3)).toEqual(["d", "e"]);
    expect(getVisibleProjectSlice(projects, -1, 3)).toEqual(["d", "e"]);
  });
});

export const PROJECTS_PER_SLIDE_DESKTOP = 3;
export const PROJECT_AUTOPLAY_INTERVAL_MS = 5000;

export function getProjectsPerSlide(viewportWidth: number): 1 | 2 | 3 {
  if (viewportWidth <= 760) return 1;
  if (viewportWidth <= 1199) return 2;
  return 3;
}

export function getProjectSlideCount(
  projectCount: number,
  projectsPerSlide: number,
) {
  if (projectCount <= 0) return 0;
  return Math.ceil(projectCount / Math.max(1, projectsPerSlide));
}

export function wrapProjectSlideIndex(index: number, slideCount: number) {
  if (slideCount <= 0) return 0;
  return ((index % slideCount) + slideCount) % slideCount;
}

export function getVisibleProjectSlice<T>(
  projects: readonly T[],
  slideIndex: number,
  projectsPerSlide: number,
) {
  const safePageSize = Math.max(1, projectsPerSlide);
  const slideCount = getProjectSlideCount(projects.length, safePageSize);
  const start =
    wrapProjectSlideIndex(slideIndex, slideCount) * safePageSize;

  return projects.slice(start, start + safePageSize);
}

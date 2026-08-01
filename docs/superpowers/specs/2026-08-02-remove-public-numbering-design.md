# Remove Public Skill and Project Numbering Design

## Goal

Remove the visible two-digit numbering from both public skill groups and project-card images, deleting the markup and dead styling rather than hiding it.

## Skill Groups

`SkillGroups.tsx` stops receiving the array index in its group map and removes the `.skill-index` paragraph entirely. Group order, localized names, skill icons, D1 content, and Admin ordering remain unchanged.

The skill row grid reclaims the removed number column:

- Desktop uses two columns: the localized group name and the flexible skill list.
- Tablet uses the same two-column structure with a narrower title column.
- Mobile uses one column, placing the group name above the two-column skill-item grid.

The `.skill-index` CSS rule is deleted. No empty spacer, generated counter, pseudo-element, or visually hidden number remains.

## Project Cards

`ProjectGrid.tsx` removes the `.project-number` span from each project image. The project map retains `projectIndex` because it still controls eager image priority for the first two projects. Carousel order, slide count, Admin ordering, project IDs, and image layout remain unchanged.

The `.project-number` CSS rule is deleted completely. The project image needs no replacement layout because the number was an absolute overlay and did not occupy normal flow.

## Accessibility and Data

The removed numbers do not label controls or convey unique information; visible order is already represented by document order. Removing them therefore does not require replacement accessible text.

No data model, validation, API, D1, R2, Admin, or deployment change is included.

## Testing

- Add source/design contracts proving `SkillGroups.tsx`, `ProjectGrid.tsx`, and public CSS contain neither `skill-index` nor `project-number`.
- Assert the desktop skill-card grid has two columns and the mobile skill-card grid has one column.
- Add rendered HTML coverage proving neither numbering class is emitted.
- Run the full build/integration suite, unit suite, ESLint, and TypeScript checks.

## Scope

In scope: the two public numbering elements, their dead CSS, and responsive skill-card grid declarations.

Out of scope: carousel status/dots, project ordering, skill ordering, timeline dates, statistics, Admin numbering, CMS data, and content copy.

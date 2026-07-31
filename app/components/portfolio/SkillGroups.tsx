import type {
  Language,
  SkillGroupEntry,
} from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";

export function SkillGroups({
  groups,
  language,
  eyebrow,
  title,
}: {
  groups: SkillGroupEntry[];
  language: Language;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="section skills-section" id="skills">
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="skills-grid">
        {groups.map((group, index) => (
          <article className="skill-card" key={group.id}>
            <p className="skill-index">{String(index + 1).padStart(2, "0")}</p>
            <h3>{localize(group.name, language)}</h3>
            <ul>
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}


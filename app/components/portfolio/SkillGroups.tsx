import Image from "next/image";
import type {
  Language,
  SkillGroupEntry,
} from "../../../lib/content/types";
import { localize } from "../../../lib/content/i18n";
import { getSkillIcon } from "../../../lib/content/skill-icons";

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
          <article className="skill-card" key={group.id} data-reveal>
            <p className="skill-index">{String(index + 1).padStart(2, "0")}</p>
            <h3>{localize(group.name, language)}</h3>
            <ul className="skill-items">
              {group.skills.map((skill) => (
                <li className="skill-item" key={skill}>
                  <span className="skill-icon-frame" aria-hidden="true">
                    <Image
                      className="skill-icon"
                      src={getSkillIcon(skill)}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                    />
                  </span>
                  <span className="skill-name">{skill}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

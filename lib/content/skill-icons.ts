export const FALLBACK_SKILL_ICON = "/icons/skills/tool.svg";

const skillIconPaths: Readonly<Record<string, string>> = {
  php: "/icons/skills/php.svg",
  laravel: "/icons/skills/laravel.svg",
  mysql: "/icons/skills/mysql.svg",
  "restful api": "/icons/skills/rest-api.svg",
  cms: "/icons/skills/cms.svg",
  javascript: "/icons/skills/javascript.svg",
  typescript: "/icons/skills/typescript.svg",
  html: "/icons/skills/html5.svg",
  css3: "/icons/skills/css3.svg",
  jquery: "/icons/skills/jquery.svg",
  angularjs: "/icons/skills/angularjs.svg",
  ajax: "/icons/skills/ajax.svg",
  "git / github": "/icons/skills/github.svg",
  linux: "/icons/skills/linux.svg",
  devops: "/icons/skills/devops.svg",
  "web hosting": "/icons/skills/web-hosting.svg",
  "responsive design": "/icons/skills/responsive-design.svg",
  "web security": "/icons/skills/web-security.svg",
  "web performance": "/icons/skills/web-performance.svg",
  seo: "/icons/skills/seo.svg",
  ga4: "/icons/skills/ga4.svg",
  "search console": "/icons/skills/google-search-console.svg",
};

function normalizeSkillName(skill: string): string {
  return skill.trim().toLocaleLowerCase("en-US");
}

export function getSkillIcon(skill: string): string {
  return skillIconPaths[normalizeSkillName(skill)] ?? FALLBACK_SKILL_ICON;
}

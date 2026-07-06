import Link from "next/link";

type SiteSectionNavProps = {
  active:
    | "home"
    | "sanmeigaku"
    | "purpose-calendar"
    | "calendar-notes"
    | "calendar-db"
    | "direction-palace-blends"
    | "adoption-status"
    | "verification-registry"
    | "developer";
};

const navGroups = [
  {
    label: "ユーザー向け",
    links: [{ key: "home", href: "/", label: "トップ" }],
  },
  {
    label: "九星方位カレンダー系",
    links: [
      { key: "purpose-calendar", href: "/purpose-calendar", label: "九星方位" },
    ],
  },
  {
    label: "命式系",
    links: [{ key: "sanmeigaku", href: "/sanmeigaku", label: "算命学" }],
  },
  {
    label: "マスタ系",
    links: [
      { key: "calendar-notes", href: "/calendar-notes", label: "用語辞典" },
      { key: "calendar-db", href: "/calendar-db", label: "暦DB" },
      {
        key: "direction-palace-blends",
        href: "/direction-palace-blends",
        label: "方位ブレンド",
      },
    ],
  },
  {
    label: "ステータス系",
    links: [
      { key: "adoption-status", href: "/adoption-status", label: "採用ステータス" },
      {
        key: "verification-registry",
        href: "/adoption-status#verification-registry",
        label: "検証レジストリ",
      },
    ],
  },
  {
    label: "開発者",
    links: [{ key: "developer", href: "/?view=dev", label: "検証画面" }],
  },
] as const;

export function SiteSectionNav({ active }: SiteSectionNavProps) {
  return (
    <nav className="siteSectionNav" aria-label="ページ構成">
      {navGroups.map((group) => (
        <div className="siteSectionNavGroup" key={group.label}>
          <span>{group.label}</span>
          <div>
            {group.links.map((link) => (
              <Link
                className={active === link.key ? "active" : undefined}
                href={link.href}
                key={link.key}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

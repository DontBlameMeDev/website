import { motion, useReducedMotion } from "motion/react";
import { NavLink } from "react-router";
import { ThemeToggle } from "~/components/layout/theme_toggle";
import { ScrollProgress } from "~/components/ui/scroll_progress";
import { NAV, SITE } from "~/lib/site";
import { useTheme } from "~/lib/theme_provider";
import { cn } from "~/lib/utils";

const linkClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"nav-link inline-flex items-center px-1 py-2 text-[11px] uppercase tracking-[0.06em] transition-colors hover:text-accent sm:px-1.5 sm:text-meta sm:tracking-[0.12em]",
		isActive
			? "text-text underline decoration-2 underline-offset-[6px]"
			: "text-subtext0",
	);

const pillTransition = { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const };

export function SiteHeader() {
	const { style } = useTheme();
	const reduced = useReducedMotion();
	const material = style === "material";
	const transition = reduced ? { duration: 0 } : pillTransition;

	return (
		<header className="site-header sticky top-0 z-40 nb-page nb-chrome">
			<div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 sm:h-16 sm:flex-nowrap sm:gap-10 sm:px-5 sm:py-0">
				<NavLink
					to="/"
					end
					aria-label={`${SITE.name}, home`}
					className="flex min-w-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[-0.01em] text-text transition-colors hover:text-accent sm:text-[13px]"
				>
					<img
						src="/images/logo.svg"
						alt=""
						width={28}
						height={28}
						className="size-6 shrink-0 nb-line nb-fill object-contain p-px sm:size-7"
					/>
					<span>{SITE.name}</span>
				</NavLink>

				<span className="order-2 ml-auto sm:order-3 sm:ml-0">
					<ThemeToggle />
				</span>

				<nav
					aria-label="Primary"
					className="order-3 flex w-full items-center gap-1 sm:order-3 sm:ml-auto sm:w-auto sm:gap-7"
				>
					{NAV.filter((item) => item.to !== "/").map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							prefetch="intent"
							className={linkClass}
						>
							{({ isActive }) => (
								<>
									{isActive && material ? (
										<motion.span
											aria-hidden="true"
											className="nav-pill"
											layoutId="material-nav-pill"
											initial={false}
											transition={transition}
										/>
									) : null}
									<span className="relative z-10">{item.label}</span>
								</>
							)}
						</NavLink>
					))}
				</nav>

				<span className="win-controls order-4" aria-hidden="true">
					<span />
					<span />
					<span />
				</span>
			</div>
			{/* The reading bar is the header's bottom rule: accent behind you,
			    edge ahead. It moves with the two-row mobile header instead of
			    crossing it. */}
			<div className="relative h-[var(--bw)] bg-[var(--edge)]">
				<ScrollProgress className="pointer-events-none absolute inset-0 bg-accent" />
			</div>
		</header>
	);
}

import { ArrowDownWideNarrow, Clock, Search, X } from "lucide-react";
import {
	AnimatePresence,
	MotionConfig,
	motion,
	useReducedMotion,
} from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PageHeader } from "~/components/layout/page_header";
import { allTags, formatDate, posts } from "~/lib/posts";
import { seo } from "~/lib/seo";
import { useTheme } from "~/lib/theme_provider";
import { cn } from "~/lib/utils";

export const meta = () =>
	seo({
		title: "Writing",
		description:
			"Everything DontBlameMe has written down: privacy, Linux, NixOS, note taking, keyboards, and the psychology of the feed.",
	});

const chipTransition = { duration: 0.24, ease: [0.16, 1, 0.3, 1] as const };

/** One tag filter chip. The pressed state owns selection. Material moves a
   shared pill behind the selected label. */
function TagChip({
	label,
	selected,
	onClick,
}: {
	label: string;
	selected: boolean;
	onClick: () => void;
}) {
	const { style } = useTheme();
	const reduced = useReducedMotion();
	const material = style === "material";
	const transition = reduced ? { duration: 0 } : chipTransition;

	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={selected}
			className={cn(
				"nb-chip transition-colors",
				material && "filter-chip",
				selected
					? "nb-accent"
					: "text-subtext0 hover:bg-surface0 hover:text-text",
			)}
		>
			{material && selected ? (
				<motion.span
					aria-hidden="true"
					className="filter-pill"
					layoutId="material-filter-pill"
					initial={false}
					transition={transition}
				/>
			) : null}
			<span className="relative z-10">{label}</span>
		</button>
	);
}

export default function BlogIndex() {
	const [params, setParams] = useSearchParams();
	const query = params.get("q") ?? "";
	const tag = params.get("tag");
	const newestFirst = params.get("sort") !== "old";
	const [mounted, setMounted] = useState(false);

	const updateParams = (
		changes: Record<string, string | null>,
		replace = false,
	) => {
		const next = new URLSearchParams(params);
		for (const [key, value] of Object.entries(changes)) {
			if (value) next.set(key, value);
			else next.delete(key);
		}
		setParams(next, { replace, preventScrollReset: true });
	};

	useEffect(() => setMounted(true), []);

	const filtered = useMemo(() => {
		const needle = query.trim().toLowerCase();
		const list = posts.filter((post) => {
			const matchesTag = !tag || post.tags.includes(tag);
			const matchesQuery =
				!needle ||
				post.title.toLowerCase().includes(needle) ||
				post.summary.toLowerCase().includes(needle) ||
				post.tags.some((value) => value.includes(needle));
			return matchesTag && matchesQuery;
		});
		return newestFirst ? list : [...list].reverse();
	}, [query, tag, newestFirst]);

	return (
		<MotionConfig reducedMotion="user">
			<div>
				<PageHeader
					index="02"
					label="Writing"
					title="Writing"
					lead="Long-form notes on privacy, Linux, and the software I break on purpose. No schedule, no newsletter, no tracking."
				/>

				<div className="mt-12 flex flex-col gap-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<label className="search-field nb-input flex w-full items-center gap-2 sm:max-w-sm">
							<Search className="size-4 shrink-0 text-subtext0" />
							<input
								type="search"
								value={query}
								onChange={(event) =>
									updateParams({ q: event.target.value }, true)
								}
								placeholder="Filter by title, summary or tag"
								aria-label="Filter by title, summary or tag"
								className="w-full bg-transparent"
							/>
							<button
								type="button"
								onClick={() => updateParams({ q: null })}
								aria-label="Clear filter"
								disabled={!query}
								tabIndex={query ? 0 : -1}
								className={cn(
									"grid size-6 shrink-0 place-items-center text-subtext0 transition hover:rotate-90 hover:text-text",
									!query && "pointer-events-none opacity-0",
								)}
							>
								<X aria-hidden="true" className="size-3.5" />
							</button>
						</label>

						<div className="flex items-center gap-4">
							<span
								aria-live="polite"
								className="min-w-14 text-right text-meta tabular-nums"
							>
								<span className="sr-only">Showing </span>
								<motion.span
									key={filtered.length}
									className="inline-block"
									initial={mounted ? { opacity: 0 } : false}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.15, ease: "easeOut" }}
								>
									{filtered.length}
								</motion.span>
								<span aria-hidden="true"> / {posts.length}</span>
								<span className="sr-only"> of {posts.length} posts</span>
							</span>
							<button
								type="button"
								onClick={() => {
									const current = new URLSearchParams(location.search);
									updateParams({
										sort: current.get("sort") === "old" ? null : "old",
									});
								}}
								aria-label={newestFirst ? "Newest first" : "Oldest first"}
								title={newestFirst ? "Newest first" : "Oldest first"}
							>
								<ArrowDownWideNarrow
									className={cn(
										"size-3.5 transition-transform duration-[var(--motion-hover)]",
										!newestFirst && "rotate-180",
									)}
								/>
								{newestFirst ? "Newest" : "Oldest"}
							</button>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						<TagChip
							label="All"
							selected={tag === null}
							onClick={() => updateParams({ tag: null })}
						/>
						{allTags.map((value) => (
							<TagChip
								key={value}
								label={value}
								selected={tag === value}
								onClick={() => {
									const current = new URLSearchParams(location.search);
									updateParams({
										tag: current.get("tag") === value ? null : value,
									});
								}}
							/>
						))}
					</div>
				</div>

				{filtered.length ? (
					<motion.ul
						layout
						className="relative mt-10 grid gap-6 sm:grid-cols-2"
					>
						<AnimatePresence initial={false} mode="popLayout">
							{filtered.map((post) => (
								<motion.li
									layout
									key={post.slug}
									className="flex"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.98 }}
									transition={{ duration: 0.18, ease: "easeOut" }}
								>
									<Link
										to={`/blog/${post.slug}`}
										prefetch="intent"
										className="nb-panel nb-lift group flex h-full w-full flex-col p-6"
									>
										<div className="flex items-start justify-between gap-4">
											<h2 className="text-xl font-bold leading-[1.1] tracking-[-0.02em] text-text transition-colors group-hover:text-accent">
												{post.title}
											</h2>
											<span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-label text-subtext0">
												<Clock aria-hidden="true" className="size-3" />
												{post.minutes} min
											</span>
										</div>

										<p className="mt-3 text-[13px] leading-relaxed text-subtext0">
											{post.summary}
										</p>

										<div className="mt-auto flex items-baseline justify-between gap-4 nb-line-t pt-3 text-meta">
											<time
												dateTime={post.date}
												className="shrink-0 whitespace-nowrap"
											>
												{formatDate(post.date)}
											</time>
											<span className="text-right">
												{post.tags.map((value) => `#${value}`).join(" ")}
											</span>
										</div>
									</Link>
								</motion.li>
							))}
						</AnimatePresence>
					</motion.ul>
				) : (
					<div className="mt-12 nb-panel p-8">
						<p className="text-sm text-subtext0">
							Nothing matches that filter.
						</p>
						<button
							type="button"
							onClick={() =>
								setParams(new URLSearchParams(), { preventScrollReset: true })
							}
							className="nb-button nb-accent mt-4"
						>
							Reset it
						</button>
					</div>
				)}
			</div>
		</MotionConfig>
	);
}

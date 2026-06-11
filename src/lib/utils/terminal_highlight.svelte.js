/**
 * @typedef {{ text: string, cls: string }} Segment
 */

export const TERMINAL_COLORS = {
	directory: "text-c-accent-0",
	symlink: "text-c-info",
	file: "text-c-neutral-0",
	executable: "text-c-success"
};

/**
 * @param {string} type
 * @param {boolean} isSymlink
 * @returns {string}
 */
export function classForNode(type, isSymlink) {
	if (isSymlink) return TERMINAL_COLORS.symlink;
	if (type === "dir") return TERMINAL_COLORS.directory;
	return TERMINAL_COLORS.file;
}

/**
 * @param {string[]} children
 * @param {(name: string) => { type: string, isSymlink: boolean }} lookup
 * @param {boolean} [classify]
 * @returns {Segment[]}
 */
export function segmentLsShort(children, lookup, classify) {
	/** @type {Segment[]} */
	const segments = [];
	for (let i = 0; i < children.length; i++) {
		if (i > 0) segments.push({ text: "    ", cls: "" });
		const c = children[i];
		const info = lookup(c);
		let name = c;
		if (classify) {
			if (info.isSymlink) name += "@";
			else if (info.type === "dir") name += "/";
		}
		segments.push({ text: name, cls: classForNode(info.type, info.isSymlink) });
	}
	return segments;
}

/**
 * @param {string} metaStr
 * @param {string} name
 * @param {string} suffix
 * @param {string} nodeType
 * @param {boolean} isSymlink
 * @returns {Segment[]}
 */
export function segmentLsLong(metaStr, name, suffix, nodeType, isSymlink) {
	return [
		{ text: metaStr, cls: "text-c-neutral-1" },
		{ text: `${name}${suffix}`, cls: classForNode(nodeType, isSymlink) }
	];
}

/* ─── git ────────────────────────────────────────────── */

/**
 * @param {string} text
 * @returns {Segment[]}
 */
export function segmentGitStatus(text) {
	/** @type {Segment[]} */
	const s = [];
	const branch = text.match(/^(On branch )(\S+)/);
	if (branch) {
		s.push({ text: branch[1], cls: "text-c-neutral-1" });
		s.push({ text: branch[2], cls: "text-c-accent-0" });
	}
	const utd = text.match(/\n(Your branch is up to date with ')([^']+)('\.)/);
	if (utd) {
		s.push({ text: utd[1], cls: "text-c-neutral-1" });
		s.push({ text: utd[2], cls: "text-c-info" });
		s.push({ text: utd[3], cls: "text-c-neutral-1" });
	}
	const tail = text.replace(/^On branch \S+/, "").replace(/\nYour branch is up to date with '[^']+'\./, "");
	s.push({ text: tail, cls: "text-c-success" });
	return s;
}

/**
 * @param {string} text
 * @returns {Segment[]}
 */
export function segmentGitCommit(text) {
	/** @type {Segment[]} */
	const s = [];
	const nl = text.indexOf("\n");
	const first = nl >= 0 ? text.slice(0, nl) : text;
	const rest = nl >= 0 ? text.slice(nl) : "";
	const m = first.match(/^\[(\S+) ([a-z0-9]+)\]\s+(.+)/);
	if (m) {
		s.push({ text: "[", cls: "text-c-neutral-1" });
		s.push({ text: m[1], cls: "text-c-accent-0" });
		s.push({ text: " ", cls: "" });
		s.push({ text: m[2], cls: "text-c-info" });
		s.push({ text: "] ", cls: "text-c-neutral-1" });
		s.push({ text: m[3], cls: "text-c-neutral-0" });
	} else {
		s.push({ text: first, cls: "text-c-neutral-0" });
	}
	if (rest) s.push({ text: rest, cls: "text-c-success" });
	return s;
}

/**
 * @param {string} text
 * @returns {Segment[]}
 */
export function segmentGitPush(text) {
	return [{ text, cls: "text-c-success" }];
}

/**
 * @param {string} text
 * @returns {Segment[]}
 */
export function segmentGitLog(text) {
	/** @type {Segment[]} */
	const s = [];
	const lines = text.split("\n");
	for (let i = 0; i < lines.length; i++) {
		if (i > 0) s.push({ text: "\n", cls: "" });
		const m = lines[i].match(/^(\* )([a-z0-9]{7}) (.+)/);
		if (m) {
			s.push({ text: m[1], cls: "text-c-neutral-1" });
			s.push({ text: m[2], cls: "text-c-info" });
			s.push({ text: m[3], cls: "text-c-neutral-0" });
		} else {
			s.push({ text: lines[i], cls: "text-c-neutral-0" });
		}
	}
	return s;
}

/* ─── cat file-type-aware highlighting ───────────────── */

/**
 * @param {string} content
 * @returns {Segment[]}
 */
export function segmentBashrc(content) {
	/** @type {Segment[]} */
	const s = [];
	const lines = content.split("\n");
	for (let i = 0; i < lines.length; i++) {
		if (i > 0) s.push({ text: "\n", cls: "" });
		const line = lines[i];
		const trimmed = line.trimStart();
		if (trimmed.startsWith("#")) {
			s.push({ text: line, cls: "text-c-neutral-1" });
		} else if (trimmed === "") {
			s.push({ text: line, cls: "" });
		} else {
			const a = line.match(/^(\s*)(alias)(\s+)([\w.-]+)(=)(')([^']*)(')(.*)$/);
			if (a) {
				s.push({ text: a[1], cls: "" });
				s.push({ text: a[2], cls: "text-c-accent-0" });
				s.push({ text: a[3], cls: "" });
				s.push({ text: a[4], cls: "text-c-neutral-0" });
				s.push({ text: a[5], cls: "text-c-neutral-1" });
				s.push({ text: a[6], cls: "text-c-neutral-1" });
				s.push({ text: a[7], cls: "text-c-info" });
				s.push({ text: a[8], cls: "text-c-neutral-1" });
				if (a[9]) s.push({ text: a[9], cls: "text-c-neutral-1" });
			} else {
				s.push({ text: line, cls: "text-c-neutral-0" });
			}
		}
	}
	return s;
}

/**
 * @param {string} content
 * @returns {Segment[]}
 */
export function segmentQuotes(content) {
	/** @type {Segment[]} */
	const s = [];
	const lines = content.split("\n");
	for (let i = 0; i < lines.length; i++) {
		if (i > 0) s.push({ text: "\n", cls: "" });
		const line = lines[i];
		if (line.trim() === "") {
			s.push({ text: line, cls: "" });
			continue;
		}
		const attr = line.match(/^(—\s*.+)/);
		if (attr) {
			s.push({ text: line, cls: "text-c-neutral-1" });
			continue;
		}
		const q = line.match(/^(".*?")(\s*—\s*.+)?$/);
		if (q) {
			s.push({ text: q[1], cls: "text-c-accent-0" });
			if (q[2]) s.push({ text: q[2], cls: "text-c-neutral-1" });
		} else {
			s.push({ text: line, cls: "text-c-neutral-0" });
		}
	}
	return s;
}

/* ─── grep match highlighting ────────────────────────── */

/**
 * @param {string} line
 * @param {string} pattern
 * @param {string} [filename]
 * @returns {Segment[]}
 */
export function segmentGrepLine(line, pattern, filename) {
	/** @type {Segment[]} */
	const s = [];
	if (filename) {
		s.push({ text: `${filename}:`, cls: "text-c-info" });
	}
	if (!pattern) {
		s.push({ text: line, cls: "text-c-neutral-1" });
		return s;
	}
	const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const re = new RegExp(`(${escaped})`, "gi");
	let last = 0;
	let m;
	while ((m = re.exec(line)) !== null) {
		if (m.index > last) s.push({ text: line.slice(last, m.index), cls: "text-c-neutral-1" });
		s.push({ text: m[0], cls: "text-c-warning" });
		last = re.lastIndex;
	}
	if (last < line.length) s.push({ text: line.slice(last), cls: "text-c-neutral-1" });
	return s;
}

/* ─── date decorative highlighting ───────────────────── */

/**
 * @param {Date} date
 * @returns {Segment[]}
 */
export function segmentDate(date) {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const d = String(date.getDate()).padStart(2, " ");
	const h = String(date.getHours()).padStart(2, "0");
	const m = String(date.getMinutes()).padStart(2, "0");
	const s = String(date.getSeconds()).padStart(2, "0");
	const tz = date.toLocaleTimeString("en-US", { timeZoneName: "short" }).split(" ")[2] ?? "UTC";
	return [
		{ text: `${days[date.getDay()]} `, cls: "text-c-neutral-1" },
		{ text: `${months[date.getMonth()]} `, cls: "text-c-accent-0" },
		{ text: `${d} `, cls: "text-c-neutral-0" },
		{ text: `${h}:${m}:${s} `, cls: "text-c-info" },
		{ text: `${tz} `, cls: "text-c-neutral-1" },
		{ text: `${date.getFullYear()}`, cls: "text-c-accent-0" }
	];
}

/* ─── input highlighting (typing) ─────────────────────── */

/**
 * @param {string} input
 * @param {Map<string, unknown>} cmdMap
 * @param {Map<string, string>} aliases
 * @param {Record<string, { type: string, children?: string[] }>} fs
 * @param {string} cwd
 * @returns {Segment[]}
 */
export function highlightInput(input, cmdMap, aliases, fs, cwd) {
	if (!input) return [];

	/** @type {Segment[]} */
	const segments = [];

	/** @param {string} p @returns {string} */
	function resolvePathCwd(p) {
		if (p === "~") return "/home/guest";
		if (p.startsWith("~/")) p = "/home/guest" + p.slice(1);
		const parts = (p.startsWith("/") ? [] : cwd.split("/").filter(Boolean)).concat(
			p.split("/").filter(Boolean)
		);
		const resolved = [];
		for (const part of parts) {
			if (part === "." || part === "") continue;
			if (part === "..") {
				resolved.pop();
				continue;
			}
			resolved.push(part);
		}
		return "/" + resolved.join("/");
	}

	/** @param {string} raw @returns {string} */
	function colorForPath(raw) {
		const resolved = resolvePathCwd(raw);
		const node = fs[resolved];
		if (!node) return "text-c-neutral-0";
		if (node.type === "dir") return "text-c-accent-0";
		return "text-c-neutral-0";
	}

	// pass 1: tokenize with whitespace preservation
	/** @type {{ text: string, isWord: boolean, type?: string }[]} */
	const rawTokens = [];
	let buf = "";
	let inSingle = false;
	let inDouble = false;

	for (const ch of input) {
		if (ch === "'" && !inDouble) { inSingle = !inSingle; buf += ch; continue; }
		if (ch === '"' && !inSingle) { inDouble = !inDouble; buf += ch; continue; }
		if (!inSingle && !inDouble && ch === " ") {
			if (buf) { rawTokens.push({ text: buf, isWord: true }); buf = ""; }
			rawTokens.push({ text: " ", isWord: false });
			continue;
		}
		buf += ch;
	}
	if (buf) rawTokens.push({ text: buf, isWord: true });
	if (input.endsWith(" ")) rawTokens.push({ text: " ", isWord: false });

	// pass 2: classify word tokens and emit segments
	const wordTokens = rawTokens.filter((t) => t.isWord);
	let wordIndex = 0;

	for (const raw of rawTokens) {
		if (!raw.isWord) {
			segments.push({ text: raw.text, cls: "" });
			continue;
		}

		const tok = raw.text;
		const localIdx = wordIndex;
		wordIndex++;

		let cls = "";
		if (localIdx === 0) {
			const name = tok.toLowerCase();
			cls = cmdMap.has(name) || aliases.has(name) ? "text-c-accent-0" : "text-c-neutral-0";
		} else if (localIdx === 1 && wordTokens[0]?.text === "git") {
			cls = "text-c-accent-0";
		} else if (tok.startsWith("-")) {
			cls = "text-c-info";
		} else if (tok.startsWith("'") || tok.startsWith('"')) {
			cls = "text-c-warning";
		} else {
			cls = colorForPath(tok);
		}
		segments.push({ text: tok, cls });
	}

	return segments;
}

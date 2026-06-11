/**
 * @typedef {{ raw: string, type: 'command' | 'flag' | 'path' | 'string' }} Token
 */

const FLAGS = {
	ls: ["-a", "-A", "-l", "-F"],
	grep: ["-i", "-r", "--color=auto"],
	git: [],
	cat: [],
	cd: []
};

/**
 * @param {string} input
 * @returns {Token[]}
 */
export function tokenizeInput(input) {
	const tokens = [];
	let inSingle = false;
	let inDouble = false;
	let current = "";

	for (const ch of input) {
		if (ch === "'" && !inDouble) {
			inSingle = !inSingle;
			current += ch;
			continue;
		}
		if (ch === '"' && !inSingle) {
			inDouble = !inDouble;
			current += ch;
			continue;
		}
		if (!inSingle && !inDouble && ch === " ") {
			if (current) tokens.push(current);
			current = "";
			continue;
		}
		current += ch;
	}
	if (current) tokens.push(current);
	if (input.endsWith(" ") || input === "") tokens.push("");

	const rawTokens = tokens;
	return rawTokens.map((raw, i) => {
		if (i === 0) return { raw, type: /** @type {const} */ ("command") };
		if (i === 1 && rawTokens[0] === "git")
			return { raw, type: /** @type {const} */ ("command") };
		if (raw.startsWith("-")) return { raw, type: /** @type {const} */ ("flag") };
		if (raw.startsWith("'") || raw.startsWith('"'))
			return { raw, type: /** @type {const} */ ("string") };
		return { raw, type: /** @type {const} */ ("path") };
	});
}

/**
 * @param {string} p
 * @param {string} cwd
 * @returns {string}
 */
function resolvePath(p, cwd) {
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

/**
 * @param {string} partial
 * @param {Record<string, { type: string, children?: string[] }>} fs
 * @param {string} cwd
 * @returns {string[]}
 */
export function getPathCompletions(partial, fs, cwd) {
	const lastSlash = partial.lastIndexOf("/");
	let dirPart, namePart;
	if (lastSlash === -1) {
		dirPart = ".";
		namePart = partial;
	} else {
		dirPart = partial.slice(0, lastSlash) || "/";
		namePart = partial.slice(lastSlash + 1);
	}

	const resolvedDir = resolvePath(dirPart, cwd);
	const dir = fs[resolvedDir];
	if (!dir || dir.type !== "dir") return [];

	const matches = (dir.children ?? []).filter((c) => c.startsWith(namePart));
	const prefix = lastSlash === -1 ? "" : partial.slice(0, lastSlash + 1);

	return matches.map((m) => {
		const childPath = resolvedDir === "/" ? `/${m}` : `${resolvedDir}/${m}`;
		const child = fs[childPath];
		const suffix = child?.type === "dir" ? "/" : "";
		return prefix + m + suffix;
	});
}

/**
 * @param {string} prefix
 * @param {Map<string, unknown>} cmdMap
 * @param {Map<string, string>} aliases
 * @returns {string[]}
 */
export function getCommandCompletions(prefix, cmdMap, aliases) {
	const cmdNames = [...new Set([...cmdMap.keys(), ...aliases.keys()])];
	if (!prefix) return cmdNames.slice().sort();
	return cmdNames.filter((c) => c.startsWith(prefix)).sort();
}

/**
 * @param {string} cmd
 * @param {string} prefix
 * @returns {string[]}
 */
export function getFlagCompletions(cmd, prefix) {
	const flags = FLAGS[/** @type {keyof typeof FLAGS} */ (cmd)];
	if (!flags) return [];
	if (!prefix) return [...flags];
	return flags.filter((f) => f.startsWith(prefix));
}

/**
 * @param {string} input
 * @param {Map<string, unknown>} cmdMap
 * @param {Map<string, string>} aliases
 * @param {Record<string, { type: string, children?: string[] }>} fs
 * @param {string} cwd
 * @returns {string[]}
 */
export function getCompletions(input, cmdMap, aliases, fs, cwd) {
	const trimmed = input.trimEnd();
	const tokens = tokenizeInput(input);
	const words = trimmed.length > 0 ? trimmed.split(/\s+/) : [];
	const hasTrailingSpace = input.endsWith(" ");

	if (words.length === 0 || (!hasTrailingSpace && words.length <= 1)) {
		const prefix = words.length === 0 ? "" : words[0];
		return getCommandCompletions(prefix, cmdMap, aliases);
	}

	const cmd = words[0];

	if (hasTrailingSpace && words.length >= 1) {
		if (cmd === "git") {
			return ["status", "commit", "push", "log"];
		}
		return getPathCompletions("", fs, cwd);
	}

	const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
	if (!lastToken) return [];

	if (cmd === "git" && words.length === 2) {
		const sub = ["status", "commit", "push", "log"];
		return sub.filter((s) => s.startsWith(lastToken.raw));
	}

	if (lastToken.type === "flag") {
		return getFlagCompletions(cmd, lastToken.raw);
	}

	return getPathCompletions(lastToken.raw, fs, cwd);
}

/**
 * @param {string} input
 * @param {string} completion
 * @returns {string}
 */
export function applyCompletion(input, completion) {
	const spaceIdx = input.lastIndexOf(" ");
	if (spaceIdx === -1) return completion;
	return input.slice(0, spaceIdx + 1) + completion;
}

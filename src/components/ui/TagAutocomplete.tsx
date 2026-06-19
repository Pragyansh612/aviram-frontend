"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
  type KeyboardEvent,
} from "react";
import {
  browseGroups,
  filterSuggestions,
  joinTags,
  parseTags,
  type CatalogGroup,
} from "@/lib/job-catalog";

export type TagAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  /** When set, empty input shows grouped browse sections. */
  browse?: { groups: CatalogGroup[]; popular: string[] };
  separator?: string;
  placeholder?: string;
  inputClassName?: string;
  className?: string;
  id?: string;
  required?: boolean;
  allowCustom?: boolean;
  maxTags?: number;
  hint?: string;
};

export default function TagAutocomplete({
  value,
  onChange,
  options,
  browse,
  separator = ", ",
  placeholder = "Type to search…",
  inputClassName = "tag-ac-input",
  className = "tag-ac",
  id: idProp,
  required,
  allowCustom = true,
  maxTags,
  hint,
}: TagAutocompleteProps) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const listId = `${inputId}-list`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = useMemo(() => parseTags(value), [value]);
  const selectedLower = useMemo(() => new Set(tags.map((t) => t.toLowerCase())), [tags]);

  const flatSuggestions = useMemo(() => {
    const picked = filterSuggestions(options, query, 14).filter(
      (s) => !selectedLower.has(s.toLowerCase()),
    );
    if (query.trim() && allowCustom) {
      const exact = options.some((o) => o.toLowerCase() === query.trim().toLowerCase());
      const inTags = selectedLower.has(query.trim().toLowerCase());
      if (!exact && !inTags && query.trim().length >= 2) {
        picked.push(`Add "${query.trim()}"`);
      }
    }
    return picked;
  }, [options, query, selectedLower, allowCustom]);

  const groupedBrowse = useMemo(() => {
    if (!browse || query.trim()) return null;
    return browseGroups(browse.groups, browse.popular, 5)
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => !selectedLower.has(i.toLowerCase())),
      }))
      .filter((g) => g.items.length > 0);
  }, [browse, query, selectedLower]);

  const flatBrowse = useMemo(() => {
    if (!groupedBrowse) return [];
    return groupedBrowse.flatMap((g) => g.items);
  }, [groupedBrowse]);

  const visibleOptions = query.trim() ? flatSuggestions : flatBrowse;

  const commitTag = useCallback(
    (raw: string) => {
      let tag = raw;
      if (tag.startsWith('Add "') && tag.endsWith('"')) {
        tag = tag.slice(5, -1);
      }
      tag = tag.trim();
      if (!tag) return;
      if (maxTags != null && tags.length >= maxTags) return;
      if (selectedLower.has(tag.toLowerCase())) {
        setQuery("");
        return;
      }
      const next = [...tags, tag];
      onChange(joinTags(next, separator));
      setQuery("");
      setActiveIdx(0);
      setOpen(true);
    },
    [tags, selectedLower, maxTags, onChange, separator],
  );

  const removeTag = useCallback(
    (tag: string) => {
      const next = tags.filter((t) => t !== tag);
      onChange(joinTags(next, separator));
    },
    [tags, onChange, separator],
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, Math.max(visibleOptions.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && visibleOptions[activeIdx]) {
        commitTag(visibleOptions[activeIdx]);
      } else if (allowCustom && query.trim()) {
        commitTag(query.trim());
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Backspace" && !query && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const showDropdown = open && (visibleOptions.length > 0 || !!(groupedBrowse?.length));

  return (
    <div className="tag-ac-wrap" ref={wrapRef}>
      <div
        className={className}
        onClick={() => inputRef.current?.focus()}
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-controls={listId}
      >
        {tags.map((tag) => (
          <span className="tag-ac-chip" key={tag}>
            {tag}
            <button
              type="button"
              className="tag-ac-chip-x"
              aria-label={`Remove ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          className={inputClassName}
          value={query}
          placeholder={tags.length ? "" : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-autocomplete="list"
          aria-controls={listId}
          autoComplete="off"
          required={required && tags.length === 0}
        />
      </div>

      {hint && <p className="tag-ac-hint">{hint}</p>}

      {showDropdown && (
        <ul className="tag-ac-drop" id={listId} role="listbox">
          {query.trim() ? (
            flatSuggestions.map((opt, i) => (
              <li key={opt} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={i === activeIdx}
                  className={"tag-ac-option" + (i === activeIdx ? " active" : "") + (opt.startsWith('Add "') ? " custom" : "")}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commitTag(opt)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  {opt}
                </button>
              </li>
            ))
          ) : (
            groupedBrowse?.map((group) => (
              <li key={group.label} className="tag-ac-group-block" role="presentation">
                <div className="tag-ac-group">{group.label}</div>
                {group.items.map((opt) => {
                  const idx = flatBrowse.indexOf(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="option"
                      aria-selected={idx === activeIdx}
                      className={"tag-ac-option" + (idx === activeIdx ? " active" : "")}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commitTag(opt)}
                      onMouseEnter={() => setActiveIdx(idx)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

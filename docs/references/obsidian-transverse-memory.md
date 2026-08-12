# Obsidian Transverse Memory

Use this reference when integrating a local Obsidian vault as transverse memory
alongside DevLog and Engineering Story artifacts.

## Role

The vault is the curated, cross-project transverse-memory layer.

Good vault candidates include:

* concepts shared across projects;
* recurring implementation or architecture patterns;
* lessons learned with multi-project value;
* curated decision summaries;
* cross-project glossaries or maps.

The vault is not the home for:

* project lifecycle state;
* approval state;
* raw Story artifacts;
* exhaustive copies of project memory;
* personal operational notes that belong in workspace memory.

## Note Contract

The first integration uses plain Markdown notes with simple YAML frontmatter.

Required frontmatter fields:

* `id`
* `title`
* `kind`
* `status`
* `sourceProjects`
* `provenance`

Optional frontmatter fields:

* `created`
* `updated`
* `tags`
* `aliases`

Expected `kind` examples:

* `concept`
* `pattern`
* `lesson`
* `decision-summary`
* `glossary`
* `map`

Expected `status` examples:

* `draft`
* `curated`

`sourceProjects` and `provenance` are simple YAML lists in the first version.

## Provenance Rules

Every transverse note must link back to authoritative sources.

Examples:

* a Story path;
* an ADR path;
* an Engineering Report path;
* a repository document path;
* a DevLog record identifier written as a reference, not as a replacement for
  project state.

The vault may summarize or connect knowledge, but it must not become the only
place where a claim can be verified.

## Trust Model

When information conflicts:

* repository source and accepted ADRs win for repository-specific behavior;
* DevLog wins for structured project-memory facts;
* approved workflow artifacts win for workflow reasoning and approval-scoped
  records;
* the vault provides contextual synthesis and links, not authority overrides.

## Local Configuration

Do not hardcode a personal vault path in repository source.

Supply the vault root path locally when invoking tools or adapters. Example:

```text
node transverse-memory/scripts/vault-catalog.mjs --vault-root /path/to/vault
```

Machine-specific values belong in workspace-local operator context, not in
committed reusable assets.

## Read-Side Catalog

The first integration is read-only.

The catalog adapter:

* scans Markdown notes under a local vault root;
* ignores `.obsidian`, hidden paths, and non-Markdown files;
* parses the minimum frontmatter contract;
* extracts outbound links for deterministic navigation;
* emits stable JSON for downstream navigation or indexing.

The adapter must never:

* create notes;
* update notes;
* rewrite frontmatter;
* infer missing project-state facts;
* act as a workflow gate.

## Validation

Run:

```text
node --test transverse-memory/scripts/vault-catalog.test.mjs
```

Manual validation should also confirm that:

* valid notes are cataloged with stable relative paths;
* invalid notes fail clearly;
* no vault file is modified during scanning.

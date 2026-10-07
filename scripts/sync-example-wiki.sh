#!/usr/bin/env bash
# Construit le wiki généré par /mod-generate-docs pour un projet legacy (exemple : classified-ads-wiki)
# et le publie comme sous-site statique de ce wiki, servi sous /exemple-wiki-legacy/.
#
# Usage : [SITE_BASE=/sous-dossier/] ./scripts/sync-example-wiki.sh [chemin du wiki d'exemple]
#   SITE_BASE : `base` du wiki hôte (défaut /) — le sous-site est servi sous ${SITE_BASE}exemple-wiki-legacy/
#   défaut du chemin : ../../legacy-poc/classified-ads-wiki (relatif à wiki-claude-code/)
#
# À relancer après chaque régénération du wiki d'exemple, puis commiter docs/public/exemple-wiki-legacy/.

set -euo pipefail

WIKI_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE_DIR="$(cd "${1:-$WIKI_ROOT/../../legacy-poc/classified-ads-wiki}" && pwd)"
SITE_BASE="${SITE_BASE:-/}"
BASE="${SITE_BASE%/}/exemple-wiki-legacy/"
OUT_DIR="$WIKI_ROOT/docs/public/exemple-wiki-legacy"

[ -f "$EXAMPLE_DIR/docs/.vitepress/config.ts" ] || [ -f "$EXAMPLE_DIR/docs/.vitepress/config.mts" ] || {
  echo "Wiki d'exemple introuvable : $EXAMPLE_DIR" >&2
  exit 1
}

echo "Source : $EXAMPLE_DIR"
[ -d "$EXAMPLE_DIR/node_modules" ] || (cd "$EXAMPLE_DIR" && npm ci)

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

(cd "$EXAMPLE_DIR" && ./node_modules/.bin/vitepress build docs --base "$BASE" --outDir "$TMP_DIR/site")

# Les liens écrits en HTML brut dans le markdown généré (<a href="/docs/...">) ignorent `base` :
# on préfixe ceux qui visent un dossier du site, dans les pages HTML et dans les chunks JS du routeur
node "$WIKI_ROOT/scripts/prefix-root-links.mjs" "$TMP_DIR/site" "$BASE"

rm -rf "$OUT_DIR"
mkdir -p "$(dirname "$OUT_DIR")"
cp -r "$TMP_DIR/site" "$OUT_DIR"

echo "Publié dans : $OUT_DIR ($(du -sh "$OUT_DIR" | cut -f1))"

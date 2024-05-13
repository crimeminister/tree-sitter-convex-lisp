package tree_sitter_convex_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-convex"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_convex.Language())
	if language == nil {
		t.Errorf("Error loading Convex grammar")
	}
}

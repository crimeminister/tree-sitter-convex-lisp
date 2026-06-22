# tree-sitter-convex-lisp

[![CI](https://github.com/crimeminister/tree-sitter-convex-lisp/actions/workflows/ci.yml/badge.svg)](https://github.com/crimeminister/tree-sitter-convex-lisp/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tree-sitter-convex-lisp.svg)](https://www.npmjs.com/package/tree-sitter-convex-lisp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Tree-sitter](https://github.com/tree-sitter/tree-sitter) parser and grammar for Convex Lisp, a powerful modern Lisp designed for decentralized systems.

## Features

- Complete parsing support for Convex Lisp (`.cvx`) syntax.
- Pre-built and supported bindings for:
  - Node.js
  - Rust
  - Python
  - Go
  - Swift
- Automated CI pipeline configured via GitHub Actions.

## Getting Started

### Installation

#### Node.js (via npm/pnpm)

```bash
pnpm add tree-sitter-convex-lisp
# or
npm install tree-sitter-convex-lisp
```

#### Rust (via Cargo)

Add this to your `Cargo.toml`:

```toml
[dependencies]
tree-sitter-convex-lisp = { git = "https://github.com/crimeminister/tree-sitter-convex-lisp.git" }
```

---

## Usage Examples

### Node.js

```javascript
const Parser = require("tree-sitter");
const ConvexLisp = require("tree-sitter-convex-lisp");

const parser = new Parser();
parser.setLanguage(ConvexLisp);

const sourceCode = '(defn my-function [x] (+ x 42))';
const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### Rust

```rust
use tree_sitter::Parser;

fn main() {
    let mut parser = Parser::new();
    parser.set_language(&tree_sitter_convex_lisp::LANGUAGE.into()).expect("Error loading Convex Lisp grammar");
    let source_code = "(defn my-function [x] (+ x 42))";
    let tree = parser.parse(source_code, None).unwrap();
    println!("{}", tree.root_node().to_sexp());
}
```

---

## Development

### Setup

Clone the repository and install development dependencies:

```bash
git clone https://github.com/crimeminister/tree-sitter-convex-lisp.git
cd tree-sitter-convex-lisp
pnpm install
```

### Build and Generate Parser

To regenerate the parser from [grammar.js](file:///home/robert/git/tree-sitter-convex-lisp/grammar.js):

```bash
pnpm run generate
# or run the full build (generate and compile C bindings via node-gyp)
pnpm run build
```

### Running Tests

Execute parser tests defined in the `test/corpus/` directory:

```bash
pnpm run test
```

Parse local example files under the `examples/` folder to check for performance and errors:

```bash
pnpm run examples
```

## Continuous Integration

The repository uses GitHub Actions for continuous integration. The workflow configuration in [.github/workflows/ci.yml](file:///home/robert/git/tree-sitter-convex-lisp/.github/workflows/ci.yml) builds and tests the parser and its bindings on:
- Ubuntu (Linux)
- ~~macOS~~
